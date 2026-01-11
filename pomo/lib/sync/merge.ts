/**
 * Merge functions for syncing local and Clerk data
 *
 * Merge strategies:
 * - Stats: Additive (add deltas, max for records)
 * - Tasks: Union by ID (keep all, merge conflicts by progress)
 * - Achievements: Union (once unlocked, stays unlocked)
 * - Settings/Goals: Cloud wins (source of truth)
 */

import type { Stats, Task, Settings, Goals, UnlockedAchievement, DayStats } from '../types'
import type { ClerkUserData, SyncMetadata, MergeResult } from './types'
import { CLERK_DATA_VERSION, MAX_TASKS_IN_CLERK, MAX_DAILY_STATS_DAYS } from './types'
import { defaultState } from '../storage'

/**
 * Get today's date in YYYY-MM-DD format
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

/**
 * Check if a date string is today or yesterday
 */
function isRecent(dateStr: string | null): boolean {
  if (!dateStr) return false
  return dateStr === getToday() || dateStr === getYesterday()
}

/**
 * Compare two date strings, return the later one
 */
function maxDate(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

/**
 * Compare two date strings, return the earlier one
 */
function minDate(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return a < b ? a : b
}

/**
 * Merge current streaks from two sources
 * Handles the complex cases of extending vs separate streaks
 */
function mergeCurrentStreak(clerk: Stats, local: Stats): number {
  const today = getToday()
  const yesterday = getYesterday()

  const clerkActive = isRecent(clerk.lastActiveDate)
  const localActive = isRecent(local.lastActiveDate)

  // Both streaks are broken
  if (!clerkActive && !localActive) return 0

  // Only clerk is active
  if (clerkActive && !localActive) return clerk.currentStreak

  // Only local is active
  if (localActive && !clerkActive) return local.currentStreak

  // Both active - check if local extends clerk's streak
  if (clerk.lastActiveDate === yesterday && local.lastActiveDate === today) {
    // Local continued the streak today
    return clerk.currentStreak + local.currentStreak
  }

  if (local.lastActiveDate === yesterday && clerk.lastActiveDate === today) {
    // Clerk is more recent (shouldn't happen often, but handle it)
    return local.currentStreak + clerk.currentStreak
  }

  // Same day or both yesterday - take max
  return Math.max(clerk.currentStreak, local.currentStreak)
}

/**
 * Merge daily stats arrays
 * Combines stats by date, summing values for same dates
 */
function mergeDailyStats(clerk: DayStats[], local: DayStats[]): DayStats[] {
  const statsMap = new Map<string, DayStats>()

  // Add clerk stats
  for (const stat of clerk) {
    statsMap.set(stat.date, { ...stat })
  }

  // Merge local stats
  for (const stat of local) {
    const existing = statsMap.get(stat.date)
    if (existing) {
      // Same date - take max (avoid double counting)
      statsMap.set(stat.date, {
        date: stat.date,
        completedPomodoros: Math.max(existing.completedPomodoros, stat.completedPomodoros),
        skippedPomodoros: Math.max(existing.skippedPomodoros, stat.skippedPomodoros),
        focusMinutes: Math.max(existing.focusMinutes, stat.focusMinutes),
      })
    } else {
      statsMap.set(stat.date, { ...stat })
    }
  }

  // Sort by date and limit to MAX_DAILY_STATS_DAYS
  return Array.from(statsMap.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_DAILY_STATS_DAYS)
}

/**
 * Merge stats with delta calculation
 * Uses lastSyncedStats to calculate what's new since last sync
 */
export function mergeStats(
  clerk: Stats,
  local: Stats,
  lastSyncedStats: Stats | null
): Stats {
  // Calculate delta (what's new since last sync)
  let pomodorosDelta: number
  let focusMinutesDelta: number

  if (lastSyncedStats) {
    // We have a checkpoint - calculate delta
    pomodorosDelta = Math.max(0, local.totalPomodoros - lastSyncedStats.totalPomodoros)
    focusMinutesDelta = Math.max(0, local.totalFocusMinutes - lastSyncedStats.totalFocusMinutes)
  } else {
    // No checkpoint - this is a new device, all local data is new
    pomodorosDelta = local.totalPomodoros
    focusMinutesDelta = local.totalFocusMinutes
  }

  const mergedCurrentStreak = mergeCurrentStreak(clerk, local)

  return {
    totalPomodoros: clerk.totalPomodoros + pomodorosDelta,
    totalFocusMinutes: clerk.totalFocusMinutes + focusMinutesDelta,
    currentStreak: mergedCurrentStreak,
    longestStreak: Math.max(clerk.longestStreak, local.longestStreak, mergedCurrentStreak),
    lastActiveDate: maxDate(clerk.lastActiveDate, local.lastActiveDate),
    dailyStats: mergeDailyStats(clerk.dailyStats, local.dailyStats),
    personalRecords: {
      mostProductiveDay: clerk.personalRecords.mostProductiveDay &&
        local.personalRecords.mostProductiveDay
        ? (clerk.personalRecords.mostProductiveDay.pomodoros >=
            local.personalRecords.mostProductiveDay.pomodoros
            ? clerk.personalRecords.mostProductiveDay
            : local.personalRecords.mostProductiveDay)
        : clerk.personalRecords.mostProductiveDay || local.personalRecords.mostProductiveDay,
      mostProductiveWeek: clerk.personalRecords.mostProductiveWeek &&
        local.personalRecords.mostProductiveWeek
        ? (clerk.personalRecords.mostProductiveWeek.pomodoros >=
            local.personalRecords.mostProductiveWeek.pomodoros
            ? clerk.personalRecords.mostProductiveWeek
            : local.personalRecords.mostProductiveWeek)
        : clerk.personalRecords.mostProductiveWeek || local.personalRecords.mostProductiveWeek,
    },
  }
}

/**
 * Merge tasks by ID
 * - New tasks from either side are kept
 * - Same ID: merge by taking most progress
 * - Only keep incomplete tasks for Clerk (limit to MAX_TASKS_IN_CLERK)
 */
export function mergeTasks(clerk: Task[], local: Task[]): Task[] {
  const taskMap = new Map<string, Task>()

  // Add all clerk tasks
  for (const task of clerk) {
    taskMap.set(task.id, { ...task })
  }

  // Merge local tasks
  for (const localTask of local) {
    const existing = taskMap.get(localTask.id)

    if (!existing) {
      // New task from local
      taskMap.set(localTask.id, { ...localTask })
    } else {
      // Same ID - merge intelligently
      taskMap.set(localTask.id, {
        ...existing,
        title: localTask.title || existing.title, // Prefer non-empty
        estimatedPomodoros: Math.max(existing.estimatedPomodoros, localTask.estimatedPomodoros),
        completedPomodoros: Math.max(existing.completedPomodoros, localTask.completedPomodoros),
        completed: existing.completed || localTask.completed,
        note: localTask.note || existing.note,
      })
    }
  }

  return Array.from(taskMap.values())
}

/**
 * Filter tasks for Clerk storage
 * Only keep incomplete tasks, limit to MAX_TASKS_IN_CLERK
 */
export function filterTasksForClerk(tasks: Task[]): Task[] {
  return tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_TASKS_IN_CLERK)
}

/**
 * Merge achievements
 * Union of both - once unlocked, stays unlocked
 * Takes earliest unlock date if both have same achievement
 */
export function mergeAchievements(
  clerk: UnlockedAchievement[],
  local: UnlockedAchievement[]
): UnlockedAchievement[] {
  const achievementMap = new Map<string, UnlockedAchievement>()

  // Add clerk achievements
  for (const ach of clerk) {
    achievementMap.set(ach.id, { ...ach })
  }

  // Merge local achievements
  for (const localAch of local) {
    const existing = achievementMap.get(localAch.id)

    if (!existing) {
      // New achievement from local
      achievementMap.set(localAch.id, { ...localAch })
    } else {
      // Both have it - keep earliest unlock date
      achievementMap.set(localAch.id, {
        id: localAch.id,
        unlockedAt: minDate(existing.unlockedAt, localAch.unlockedAt) || existing.unlockedAt,
        seenAt: existing.seenAt || localAch.seenAt,
      })
    }
  }

  return Array.from(achievementMap.values())
}

/**
 * Merge settings
 * Cloud is source of truth if it has non-default values
 */
export function mergeSettings(clerk: Settings | null, local: Settings): Settings {
  if (!clerk) return local

  // Check if clerk has meaningful settings (not just defaults)
  const clerkHasCustomSettings =
    clerk.pomodoro !== defaultState.settings.pomodoro ||
    clerk.shortBreak !== defaultState.settings.shortBreak ||
    clerk.longBreak !== defaultState.settings.longBreak

  if (clerkHasCustomSettings) {
    return clerk // Cloud wins
  }

  return local // Use local if cloud is default
}

/**
 * Merge goals
 * Cloud is source of truth if set
 */
export function mergeGoals(clerk: Goals | null, local: Goals): Goals {
  if (!clerk) return local

  return {
    dailyPomodoros: clerk.dailyPomodoros ?? local.dailyPomodoros,
    weeklyPomodoros: clerk.weeklyPomodoros ?? local.weeklyPomodoros,
  }
}

/**
 * Main merge function - orchestrates all merges
 */
export function mergeData(
  clerkData: ClerkUserData | null,
  localStats: Stats,
  localTasks: Task[],
  localSettings: Settings,
  localGoals: Goals,
  localAchievements: UnlockedAchievement[],
  syncMetadata: SyncMetadata
): MergeResult {
  const conflicts: string[] = []

  // If no clerk data, upload local
  if (!clerkData) {
    return {
      data: {
        version: CLERK_DATA_VERSION,
        stats: localStats,
        tasks: filterTasksForClerk(localTasks),
        settings: localSettings,
        goals: localGoals,
        achievements: localAchievements,
        lastSyncedAt: new Date().toISOString(),
      },
      localTasks: localTasks, // Keep all local tasks
      hasChanges: true,
      conflicts: ['First sync - uploaded local data to cloud'],
    }
  }

  // Merge each data type
  const mergedStats = mergeStats(clerkData.stats, localStats, syncMetadata.lastSyncedStats)
  const mergedTasks = mergeTasks(clerkData.tasks, localTasks)
  const mergedAchievements = mergeAchievements(clerkData.achievements, localAchievements)
  const mergedSettings = mergeSettings(clerkData.settings, localSettings)
  const mergedGoals = mergeGoals(clerkData.goals, localGoals)

  // Track if there were actual changes
  const hasChanges =
    mergedStats.totalPomodoros !== clerkData.stats.totalPomodoros ||
    mergedTasks.length !== clerkData.tasks.length ||
    mergedAchievements.length !== clerkData.achievements.length

  return {
    data: {
      version: CLERK_DATA_VERSION,
      stats: mergedStats,
      tasks: filterTasksForClerk(mergedTasks),
      settings: mergedSettings,
      goals: mergedGoals,
      achievements: mergedAchievements,
      lastSyncedAt: new Date().toISOString(),
    },
    localTasks: mergedTasks, // All tasks for local storage
    hasChanges,
    conflicts,
  }
}
