/**
 * Pure calculation functions for CodeFocus stats
 * All functions are pure - no side effects, same input = same output
 */

import type {
  DayStats,
  Stats,
  PersonalRecords,
  Level,
  GoalProgress,
  HeatmapDay,
  Goals,
} from './types'
import { getToday } from './storage'

/**
 * Calculate current streak from daily stats
 */
export function calculateStreak(dailyStats: DayStats[], today: string): number {
  if (dailyStats.length === 0) return 0

  const sortedDays = [...dailyStats]
    .filter((d) => d.completedPomodoros > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sortedDays.length === 0) return 0

  const todayDate = new Date(today)
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  const hasActivityToday = sortedDays.some((d) => d.date === today)
  const hasActivityYesterday = sortedDays.some((d) => d.date === yesterday)

  if (!hasActivityToday && !hasActivityYesterday) return 0

  let streak = 0
  const checkDate = hasActivityToday ? new Date(todayDate) : new Date(yesterdayDate)

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const dayStats = sortedDays.find((d) => d.date === dateStr)

    if (dayStats && dayStats.completedPomodoros > 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate personal records from daily stats
 */
export function calculatePersonalRecords(dailyStats: DayStats[]): PersonalRecords {
  let mostProductiveDay = { date: '', pomodoros: 0 }

  // Find most productive day
  dailyStats.forEach((day) => {
    if (day.completedPomodoros > mostProductiveDay.pomodoros) {
      mostProductiveDay = { date: day.date, pomodoros: day.completedPomodoros }
    }
  })

  // Calculate weekly stats
  const weeklyMap = new Map<string, number>()
  dailyStats.forEach((day) => {
    const date = new Date(day.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]

    weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + day.completedPomodoros)
  })

  let mostProductiveWeek = { startDate: '', pomodoros: 0 }
  weeklyMap.forEach((pomodoros, weekStart) => {
    if (pomodoros > mostProductiveWeek.pomodoros) {
      mostProductiveWeek = { startDate: weekStart, pomodoros }
    }
  })

  return {
    mostProductiveDay: mostProductiveDay.pomodoros > 0 ? mostProductiveDay : null,
    mostProductiveWeek: mostProductiveWeek.pomodoros > 0 ? mostProductiveWeek : null,
  }
}

/**
 * Calculate focus score (0-100) based on today's completion rate and streak
 */
export function calculateFocusScore(todayStats: DayStats, currentStreak: number): number {
  const total = todayStats.completedPomodoros + todayStats.skippedPomodoros

  if (total === 0) return 100

  const completionRate = todayStats.completedPomodoros / total
  let score = Math.round(completionRate * 100)

  // Streak bonuses
  if (currentStreak >= 3) score = Math.min(100, score + 5)
  if (currentStreak >= 7) score = Math.min(100, score + 5)

  return score
}

/**
 * Calculate user level based on total focus hours
 */
export function calculateLevel(totalFocusMinutes: number): Level {
  const totalHours = Math.floor(totalFocusMinutes / 60)

  if (totalHours >= 500) {
    return { name: 'Grandmaster', tier: 4, progress: 100, nextTier: null }
  }
  if (totalHours >= 100) {
    return { name: 'Master', tier: 3, progress: (totalHours - 100) / 4, nextTier: 500 }
  }
  if (totalHours >= 25) {
    return { name: 'Craftsman', tier: 2, progress: (totalHours - 25) / 0.75, nextTier: 100 }
  }
  return { name: 'Apprentice', tier: 1, progress: (totalHours / 25) * 100, nextTier: 25 }
}

/**
 * Calculate goal progress for daily and weekly goals
 */
export function calculateGoalProgress(
  dailyStats: DayStats[],
  goals: Goals,
  today: string
): GoalProgress {
  // Get today's stats
  const todayStats = dailyStats.find((d) => d.date === today) || {
    date: today,
    completedPomodoros: 0,
    skippedPomodoros: 0,
    focusMinutes: 0,
  }

  // Calculate current week stats
  const todayDate = new Date(today)
  const weekStart = new Date(todayDate)
  weekStart.setDate(todayDate.getDate() - todayDate.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  let weeklyTotal = 0
  dailyStats.forEach((day) => {
    if (day.date >= weekStartStr) {
      weeklyTotal += day.completedPomodoros
    }
  })

  return {
    daily: {
      current: todayStats.completedPomodoros,
      target: goals.dailyPomodoros,
      percentage: goals.dailyPomodoros
        ? Math.min(100, (todayStats.completedPomodoros / goals.dailyPomodoros) * 100)
        : null,
    },
    weekly: {
      current: weeklyTotal,
      target: goals.weeklyPomodoros,
      percentage: goals.weeklyPomodoros
        ? Math.min(100, (weeklyTotal / goals.weeklyPomodoros) * 100)
        : null,
    },
  }
}

/**
 * Generate heatmap data for the last ~6 months (181 days)
 * @param dailyStats - Array of daily statistics
 * @param todayDate - Today's date (for testability/purity)
 */
export function generateHeatmapData(dailyStats: DayStats[], todayDate?: Date): HeatmapDay[][] {
  const data: HeatmapDay[] = []
  const today = todayDate ?? new Date()

  // Generate 181 days (today + 180 days back)
  for (let i = 180; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    const dayStats = dailyStats.find((s) => s.date === dateStr)

    let level = 0
    let count = 0
    if (dayStats) {
      count = dayStats.completedPomodoros
      if (count >= 8) level = 4
      else if (count >= 5) level = 3
      else if (count >= 3) level = 2
      else if (count >= 1) level = 1
    }

    data.push({ date: dateStr, count, level })
  }

  // Return as 2D array for component compatibility
  return [data]
}

/**
 * Get today's stats from daily stats array
 * @param dailyStats - Array of daily statistics
 * @param today - Today's date string in YYYY-MM-DD format (optional, defaults to current date)
 */
export function getTodayStats(dailyStats: DayStats[], today?: string): DayStats {
  const todayStr = today ?? getToday()
  return (
    dailyStats.find((d) => d.date === todayStr) || {
      date: todayStr,
      completedPomodoros: 0,
      skippedPomodoros: 0,
      focusMinutes: 0,
    }
  )
}

/**
 * Format total focus time into hours and minutes
 */
export function formatTotalTime(totalFocusMinutes: number): {
  hours: number
  minutes: number
  total: number
} {
  return {
    hours: Math.floor(totalFocusMinutes / 60),
    minutes: totalFocusMinutes % 60,
    total: totalFocusMinutes,
  }
}

/**
 * Update daily stats with a new completed pomodoro
 * @param stats - Current stats object
 * @param pomodoroMinutes - Duration of the pomodoro in minutes
 * @param today - Today's date string (optional, defaults to current date)
 */
export function addCompletedPomodoro(
  stats: Stats,
  pomodoroMinutes: number,
  today?: string
): Stats {
  const todayStr = today ?? getToday()
  const existingIndex = stats.dailyStats.findIndex((d) => d.date === todayStr)
  let newDailyStats: DayStats[]

  if (existingIndex >= 0) {
    newDailyStats = stats.dailyStats.map((d, i) =>
      i === existingIndex
        ? {
            ...d,
            completedPomodoros: d.completedPomodoros + 1,
            focusMinutes: d.focusMinutes + pomodoroMinutes,
          }
        : d
    )
  } else {
    newDailyStats = [
      ...stats.dailyStats,
      {
        date: todayStr,
        completedPomodoros: 1,
        skippedPomodoros: 0,
        focusMinutes: pomodoroMinutes,
      },
    ]
  }

  const newStreak = calculateStreak(newDailyStats, todayStr)
  const newLongestStreak = Math.max(stats.longestStreak, newStreak)
  const newRecords = calculatePersonalRecords(newDailyStats)

  return {
    ...stats,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    totalFocusMinutes: stats.totalFocusMinutes + pomodoroMinutes,
    totalPomodoros: stats.totalPomodoros + 1,
    dailyStats: newDailyStats,
    lastActiveDate: todayStr,
    personalRecords: newRecords,
  }
}

/**
 * Update daily stats with a skipped pomodoro
 * @param stats - Current stats object
 * @param today - Today's date string (optional, defaults to current date)
 */
export function addSkippedPomodoro(stats: Stats, today?: string): Stats {
  const todayStr = today ?? getToday()
  const existingIndex = stats.dailyStats.findIndex((d) => d.date === todayStr)
  let newDailyStats: DayStats[]

  if (existingIndex >= 0) {
    newDailyStats = stats.dailyStats.map((d, i) =>
      i === existingIndex
        ? { ...d, skippedPomodoros: d.skippedPomodoros + 1 }
        : d
    )
  } else {
    newDailyStats = [
      ...stats.dailyStats,
      {
        date: todayStr,
        completedPomodoros: 0,
        skippedPomodoros: 1,
        focusMinutes: 0,
      },
    ]
  }

  return {
    ...stats,
    dailyStats: newDailyStats,
    lastActiveDate: todayStr,
  }
}
