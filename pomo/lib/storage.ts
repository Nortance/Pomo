/**
 * Storage layer for CodeFocus app
 * Handles localStorage persistence with migration support
 */

import type { PersistedState, Stats, Settings, Goals, Task, TimerMode } from './types'

const STORAGE_KEY = 'codefocus-app'
const TIMER_SESSION_KEY = 'codefocus-timer-session'
const CURRENT_VERSION = 1

// Timer session state for persistence across refreshes
export interface TimerSessionState {
  mode: TimerMode
  timeLeft: number
  startDuration: number
  isRunning: boolean
  savedAt: number // Unix timestamp in ms
  sessionPomodoros: number
  activeTaskId: string | null
}

// Default values
const defaultStats: Stats = {
  currentStreak: 0,
  longestStreak: 0,
  totalFocusMinutes: 0,
  totalPomodoros: 0,
  dailyStats: [],
  lastActiveDate: null,
  personalRecords: {
    mostProductiveDay: null,
    mostProductiveWeek: null,
  },
}

const defaultSettings: Settings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
  soundEnabled: true,
}

const defaultGoals: Goals = {
  dailyPomodoros: null,
  weeklyPomodoros: null,
}

export const defaultState: PersistedState = {
  stats: defaultStats,
  tasks: [],
  settings: defaultSettings,
  goals: defaultGoals,
  achievements: [],
  version: CURRENT_VERSION,
}

/**
 * Migrate old stats-only format to new unified format
 */
function migrateFromLegacy(): PersistedState | null {
  const legacyKey = 'codefocus-stats'
  const legacyData = localStorage.getItem(legacyKey)

  if (!legacyData) return null

  try {
    const parsed = JSON.parse(legacyData)

    // Extract goals from old format (they were stored inside stats)
    const goals: Goals = {
      dailyPomodoros: parsed.goals?.dailyPomodoros ?? null,
      weeklyPomodoros: parsed.goals?.weeklyPomodoros ?? null,
    }

    // Build new stats object (without goals)
    const stats: Stats = {
      currentStreak: parsed.currentStreak ?? 0,
      longestStreak: parsed.longestStreak ?? 0,
      totalFocusMinutes: parsed.totalFocusMinutes ?? 0,
      totalPomodoros: parsed.totalPomodoros ?? 0,
      dailyStats: parsed.dailyStats ?? [],
      lastActiveDate: parsed.lastActiveDate ?? null,
      personalRecords: parsed.personalRecords ?? {
        mostProductiveDay: null,
        mostProductiveWeek: null,
      },
    }

    return {
      stats,
      tasks: [], // Tasks weren't persisted in old format
      settings: defaultSettings,
      goals,
      achievements: [],
      version: CURRENT_VERSION,
    }
  } catch {
    return null
  }
}

/**
 * Deep merge stats to handle nested objects like personalRecords
 */
function mergeStats(defaults: Stats, parsed: Partial<Stats> | undefined): Stats {
  if (!parsed) return defaults

  return {
    currentStreak: parsed.currentStreak ?? defaults.currentStreak,
    longestStreak: parsed.longestStreak ?? defaults.longestStreak,
    totalFocusMinutes: parsed.totalFocusMinutes ?? defaults.totalFocusMinutes,
    totalPomodoros: parsed.totalPomodoros ?? defaults.totalPomodoros,
    dailyStats: parsed.dailyStats ?? defaults.dailyStats,
    lastActiveDate: parsed.lastActiveDate ?? defaults.lastActiveDate,
    personalRecords: {
      mostProductiveDay: parsed.personalRecords?.mostProductiveDay ?? defaults.personalRecords.mostProductiveDay,
      mostProductiveWeek: parsed.personalRecords?.mostProductiveWeek ?? defaults.personalRecords.mostProductiveWeek,
    },
  }
}

/**
 * Load state from localStorage
 */
export function loadState(): PersistedState {
  if (typeof window === 'undefined') {
    return defaultState
  }

  // Try loading new format first
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Deep merge to handle nested objects properly
      return {
        stats: mergeStats(defaultStats, parsed.stats),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        settings: { ...defaultSettings, ...parsed.settings },
        goals: { ...defaultGoals, ...parsed.goals },
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        version: parsed.version ?? CURRENT_VERSION,
      }
    } catch {
      // Fall through to legacy migration
    }
  }

  // Try migrating from legacy format
  const migrated = migrateFromLegacy()
  if (migrated) {
    // Save in new format
    saveState(migrated)
    return migrated
  }

  return defaultState
}

/**
 * Save state to localStorage
 */
export function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/**
 * Clear all stored data (useful for testing/reset)
 */
export function clearState(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('codefocus-stats') // Also clear legacy
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Save timer session state to localStorage
 */
export function saveTimerSession(state: TimerSessionState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TIMER_SESSION_KEY, JSON.stringify(state))
}

// Maximum reasonable timer duration in seconds (3 hours)
const MAX_TIMER_DURATION_SECONDS = 3 * 60 * 60

/**
 * Load timer session state from localStorage
 * Returns null if no saved state or if state is stale (> 24 hours old)
 */
export function loadTimerSession(): TimerSessionState | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(TIMER_SESSION_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored) as TimerSessionState

    // Discard if saved more than 24 hours ago (stale session)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in ms
    if (Date.now() - parsed.savedAt > maxAge) {
      clearTimerSession()
      return null
    }

    // Validate startDuration is reasonable (max 3 hours)
    if (parsed.startDuration > MAX_TIMER_DURATION_SECONDS || parsed.startDuration <= 0) {
      console.warn('[CodeFocus] Invalid startDuration in saved session, clearing')
      clearTimerSession()
      return null
    }

    // Validate timeLeft is consistent with startDuration
    if (parsed.timeLeft > parsed.startDuration || parsed.timeLeft < 0) {
      console.warn('[CodeFocus] Inconsistent timeLeft in saved session, clearing')
      clearTimerSession()
      return null
    }

    // Validate savedAt is in the past and not too far in the future
    if (parsed.savedAt > Date.now() + 60000) { // Allow 1 minute clock drift
      console.warn('[CodeFocus] Future savedAt timestamp, clearing session')
      clearTimerSession()
      return null
    }

    return parsed
  } catch {
    return null
  }
}

/**
 * Clear saved timer session
 */
export function clearTimerSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TIMER_SESSION_KEY)
}
