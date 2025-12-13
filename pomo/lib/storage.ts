/**
 * Storage layer for CodeFocus app
 * Handles localStorage persistence with migration support
 */

import type { PersistedState, Stats, Settings, Goals, Task } from './types'

const STORAGE_KEY = 'codefocus-app'
const CURRENT_VERSION = 1

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
