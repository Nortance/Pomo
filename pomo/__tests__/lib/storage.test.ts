import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadState, saveState, clearState, getToday, defaultState } from '@/lib/storage'
import type { PersistedState, Stats } from '@/lib/types'

const STORAGE_KEY = 'codefocus-app'
const LEGACY_KEY = 'codefocus-stats'

describe('defaultState', () => {
  it('should have correct default stats', () => {
    expect(defaultState.stats.currentStreak).toBe(0)
    expect(defaultState.stats.longestStreak).toBe(0)
    expect(defaultState.stats.totalFocusMinutes).toBe(0)
    expect(defaultState.stats.totalPomodoros).toBe(0)
    expect(defaultState.stats.dailyStats).toEqual([])
    expect(defaultState.stats.lastActiveDate).toBeNull()
    expect(defaultState.stats.personalRecords.mostProductiveDay).toBeNull()
    expect(defaultState.stats.personalRecords.mostProductiveWeek).toBeNull()
  })

  it('should have correct default settings', () => {
    expect(defaultState.settings.pomodoro).toBe(25)
    expect(defaultState.settings.shortBreak).toBe(5)
    expect(defaultState.settings.longBreak).toBe(15)
    expect(defaultState.settings.autoStartBreaks).toBe(false)
    expect(defaultState.settings.autoStartPomodoros).toBe(false)
    expect(defaultState.settings.longBreakInterval).toBe(4)
    expect(defaultState.settings.soundEnabled).toBe(true)
  })

  it('should have correct default goals', () => {
    expect(defaultState.goals.dailyPomodoros).toBeNull()
    expect(defaultState.goals.weeklyPomodoros).toBeNull()
  })

  it('should have empty arrays for tasks and achievements', () => {
    expect(defaultState.tasks).toEqual([])
    expect(defaultState.achievements).toEqual([])
  })

  it('should have version 1', () => {
    expect(defaultState.version).toBe(1)
  })
})

describe('loadState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('when localStorage is empty', () => {
    it('should return default state', () => {
      const result = loadState()
      expect(result).toEqual(defaultState)
    })
  })

  describe('when valid data exists', () => {
    it('should load persisted state', () => {
      const savedState: PersistedState = {
        ...defaultState,
        stats: {
          ...defaultState.stats,
          totalPomodoros: 10,
          currentStreak: 3,
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

      const result = loadState()

      expect(result.stats.totalPomodoros).toBe(10)
      expect(result.stats.currentStreak).toBe(3)
    })

    it('should preserve tasks', () => {
      const savedState: PersistedState = {
        ...defaultState,
        tasks: [
          {
            id: '1',
            title: 'Test Task',
            estimatedPomodoros: 2,
            completedPomodoros: 1,
            completed: false,
            createdAt: '2024-01-15',
          },
        ],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

      const result = loadState()

      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].title).toBe('Test Task')
    })

    it('should preserve settings', () => {
      const savedState: PersistedState = {
        ...defaultState,
        settings: {
          ...defaultState.settings,
          pomodoro: 30,
          soundEnabled: false,
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

      const result = loadState()

      expect(result.settings.pomodoro).toBe(30)
      expect(result.settings.soundEnabled).toBe(false)
    })

    it('should preserve achievements', () => {
      const savedState: PersistedState = {
        ...defaultState,
        achievements: [
          { id: 'first-focus', unlockedAt: '2024-01-15T10:00:00Z' },
        ],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState))

      const result = loadState()

      expect(result.achievements).toHaveLength(1)
      expect(result.achievements[0].id).toBe('first-focus')
    })
  })

  describe('when partial data exists', () => {
    it('should merge with defaults', () => {
      const partialState = {
        stats: { totalPomodoros: 5 },
        // Missing other fields
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partialState))

      const result = loadState()

      // Custom value preserved
      expect(result.stats.totalPomodoros).toBe(5)
      // Defaults filled in
      expect(result.stats.currentStreak).toBe(0)
      expect(result.settings.pomodoro).toBe(25)
      expect(result.tasks).toEqual([])
    })

    it('should handle missing nested personalRecords', () => {
      const partialState = {
        stats: {
          totalPomodoros: 5,
          personalRecords: {
            mostProductiveDay: { date: '2024-01-15', pomodoros: 8 },
            // Missing mostProductiveWeek
          },
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partialState))

      const result = loadState()

      expect(result.stats.personalRecords.mostProductiveDay).toEqual({
        date: '2024-01-15',
        pomodoros: 8,
      })
      expect(result.stats.personalRecords.mostProductiveWeek).toBeNull()
    })

    it('should handle invalid arrays gracefully', () => {
      const invalidState = {
        stats: defaultState.stats,
        tasks: 'not an array',
        achievements: null,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidState))

      const result = loadState()

      expect(result.tasks).toEqual([])
      expect(result.achievements).toEqual([])
    })
  })

  describe('when JSON is corrupted', () => {
    it('should return default state on parse error', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json {{{')

      const result = loadState()

      expect(result).toEqual(defaultState)
    })
  })

  describe('legacy migration', () => {
    it('should migrate from legacy format', () => {
      const legacyData = {
        currentStreak: 5,
        longestStreak: 10,
        totalFocusMinutes: 500,
        totalPomodoros: 20,
        dailyStats: [
          { date: '2024-01-15', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
        ],
        lastActiveDate: '2024-01-15',
        goals: {
          dailyPomodoros: 8,
          weeklyPomodoros: 25,
        },
      }
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyData))

      const result = loadState()

      expect(result.stats.currentStreak).toBe(5)
      expect(result.stats.totalPomodoros).toBe(20)
      expect(result.goals.dailyPomodoros).toBe(8)
      expect(result.goals.weeklyPomodoros).toBe(25)
      expect(result.tasks).toEqual([]) // Tasks weren't in legacy
    })

    it('should save migrated data in new format', () => {
      const legacyData = {
        currentStreak: 5,
        totalPomodoros: 10,
      }
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyData))

      loadState()

      // Should now have data in new format
      const newFormatData = localStorage.getItem(STORAGE_KEY)
      expect(newFormatData).not.toBeNull()
      const parsed = JSON.parse(newFormatData!)
      expect(parsed.stats.currentStreak).toBe(5)
    })

    it('should prefer new format over legacy', () => {
      // Both formats exist
      const newData: PersistedState = {
        ...defaultState,
        stats: { ...defaultState.stats, totalPomodoros: 100 },
      }
      const legacyData = { totalPomodoros: 50 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyData))

      const result = loadState()

      expect(result.stats.totalPomodoros).toBe(100) // From new format
    })

    it('should handle corrupted legacy data', () => {
      localStorage.setItem(LEGACY_KEY, 'invalid json')

      const result = loadState()

      expect(result).toEqual(defaultState)
    })

    it('should handle missing fields in legacy data', () => {
      const legacyData = {
        totalPomodoros: 10,
        // Missing all other fields
      }
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacyData))

      const result = loadState()

      expect(result.stats.totalPomodoros).toBe(10)
      expect(result.stats.currentStreak).toBe(0)
      expect(result.stats.personalRecords.mostProductiveDay).toBeNull()
    })
  })
})

describe('saveState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save state to localStorage', () => {
    const state: PersistedState = {
      ...defaultState,
      stats: { ...defaultState.stats, totalPomodoros: 42 },
    }

    saveState(state)

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.stats.totalPomodoros).toBe(42)
  })

  it('should overwrite existing data', () => {
    const state1: PersistedState = {
      ...defaultState,
      stats: { ...defaultState.stats, totalPomodoros: 10 },
    }
    const state2: PersistedState = {
      ...defaultState,
      stats: { ...defaultState.stats, totalPomodoros: 20 },
    }

    saveState(state1)
    saveState(state2)

    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(stored!)
    expect(parsed.stats.totalPomodoros).toBe(20)
  })

  it('should preserve all fields', () => {
    const state: PersistedState = {
      stats: {
        currentStreak: 3,
        longestStreak: 7,
        totalFocusMinutes: 250,
        totalPomodoros: 10,
        dailyStats: [],
        lastActiveDate: '2024-01-15',
        personalRecords: {
          mostProductiveDay: { date: '2024-01-15', pomodoros: 8 },
          mostProductiveWeek: null,
        },
      },
      tasks: [
        {
          id: '1',
          title: 'Task',
          estimatedPomodoros: 2,
          completedPomodoros: 1,
          completed: false,
          createdAt: '2024-01-15',
        },
      ],
      settings: {
        pomodoro: 30,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreaks: true,
        autoStartPomodoros: false,
        longBreakInterval: 4,
        soundEnabled: false,
      },
      goals: {
        dailyPomodoros: 8,
        weeklyPomodoros: 25,
      },
      achievements: [{ id: 'first-focus', unlockedAt: '2024-01-15T10:00:00Z' }],
      version: 1,
    }

    saveState(state)
    const result = loadState()

    expect(result).toEqual(state)
  })
})

describe('clearState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should remove current storage key', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState))

    clearState()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('should remove legacy storage key', () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ totalPomodoros: 10 }))

    clearState()

    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })

  it('should remove both keys', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState))
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ totalPomodoros: 10 }))

    clearState()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })

  it('should not throw when keys do not exist', () => {
    expect(() => clearState()).not.toThrow()
  })
})

describe('getToday', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const result = getToday()

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('should return current date', () => {
    const now = new Date()
    const expected = now.toISOString().split('T')[0]

    const result = getToday()

    expect(result).toBe(expected)
  })
})

describe('round-trip persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should preserve data through save and load cycle', () => {
    const original: PersistedState = {
      ...defaultState,
      stats: {
        ...defaultState.stats,
        totalPomodoros: 42,
        currentStreak: 5,
        dailyStats: [
          { date: '2024-01-15', completedPomodoros: 5, skippedPomodoros: 1, focusMinutes: 125 },
        ],
      },
      tasks: [
        {
          id: 'task-1',
          title: 'Test Task',
          estimatedPomodoros: 4,
          completedPomodoros: 2,
          completed: false,
          createdAt: '2024-01-15',
        },
      ],
      achievements: [{ id: 'first-focus', unlockedAt: '2024-01-15' }],
    }

    saveState(original)
    const loaded = loadState()

    expect(loaded).toEqual(original)
  })

  it('should handle multiple save/load cycles', () => {
    let state = defaultState

    // Cycle 1
    state = { ...state, stats: { ...state.stats, totalPomodoros: 1 } }
    saveState(state)
    state = loadState()
    expect(state.stats.totalPomodoros).toBe(1)

    // Cycle 2
    state = { ...state, stats: { ...state.stats, totalPomodoros: 2 } }
    saveState(state)
    state = loadState()
    expect(state.stats.totalPomodoros).toBe(2)

    // Cycle 3
    state = { ...state, stats: { ...state.stats, totalPomodoros: 3 } }
    saveState(state)
    state = loadState()
    expect(state.stats.totalPomodoros).toBe(3)
  })
})
