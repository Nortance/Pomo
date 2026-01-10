import { describe, it, expect } from 'vitest'
import {
  ACHIEVEMENTS,
  checkNewAchievements,
  getAllAchievements,
  getAchievementById,
  getUnlockedCount,
  type AchievementContext,
} from '@/lib/achievements'
import type { Stats, DayStats } from '@/lib/types'

// Helper to create a default Stats object
function createStats(overrides: Partial<Stats> = {}): Stats {
  return {
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
    ...overrides,
  }
}

// Helper to create DayStats
function createDayStats(date: string, completed: number): DayStats {
  return {
    date,
    completedPomodoros: completed,
    skippedPomodoros: 0,
    focusMinutes: completed * 25,
  }
}

describe('ACHIEVEMENTS', () => {
  it('should have 19 total achievements', () => {
    expect(ACHIEVEMENTS).toHaveLength(19)
  })

  it('should have unique IDs', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have all required fields', () => {
    ACHIEVEMENTS.forEach((achievement) => {
      expect(achievement.id).toBeDefined()
      expect(achievement.name).toBeDefined()
      expect(achievement.description).toBeDefined()
      expect(achievement.icon).toBeDefined()
      expect(achievement.category).toMatch(/^(milestone|streak|level|special)$/)
      expect(typeof achievement.condition).toBe('function')
    })
  })
})

describe('Milestone Achievements', () => {
  describe('first-focus', () => {
    it('should unlock at 1 pomodoro', () => {
      const stats = createStats({ totalPomodoros: 1 })
      const achievement = getAchievementById('first-focus')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock at 0 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 0 })
      const achievement = getAchievementById('first-focus')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('getting-started', () => {
    it('should unlock at 10 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 10 })
      const achievement = getAchievementById('getting-started')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock at 9 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 9 })
      const achievement = getAchievementById('getting-started')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('half-century', () => {
    it('should unlock at 50 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 50 })
      const achievement = getAchievementById('half-century')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock at 49 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 49 })
      const achievement = getAchievementById('half-century')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('centurion', () => {
    it('should unlock at 100 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 100 })
      const achievement = getAchievementById('centurion')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock at 99 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 99 })
      const achievement = getAchievementById('centurion')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('focus-legend', () => {
    it('should unlock at 500 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 500 })
      const achievement = getAchievementById('focus-legend')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock at 499 pomodoros', () => {
      const stats = createStats({ totalPomodoros: 499 })
      const achievement = getAchievementById('focus-legend')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })
})

describe('Streak Achievements', () => {
  describe('streak-starter', () => {
    it('should unlock with currentStreak of 3', () => {
      const stats = createStats({ currentStreak: 3, longestStreak: 3 })
      const achievement = getAchievementById('streak-starter')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should unlock with longestStreak of 3 even if current is lower', () => {
      const stats = createStats({ currentStreak: 1, longestStreak: 3 })
      const achievement = getAchievementById('streak-starter')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock with streaks below 3', () => {
      const stats = createStats({ currentStreak: 2, longestStreak: 2 })
      const achievement = getAchievementById('streak-starter')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('week-warrior', () => {
    it('should unlock with currentStreak of 7', () => {
      const stats = createStats({ currentStreak: 7, longestStreak: 7 })
      const achievement = getAchievementById('week-warrior')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should unlock with longestStreak of 7 even if current is lower', () => {
      const stats = createStats({ currentStreak: 0, longestStreak: 7 })
      const achievement = getAchievementById('week-warrior')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock with streaks below 7', () => {
      const stats = createStats({ currentStreak: 6, longestStreak: 6 })
      const achievement = getAchievementById('week-warrior')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('month-master', () => {
    it('should unlock with currentStreak of 30', () => {
      const stats = createStats({ currentStreak: 30, longestStreak: 30 })
      const achievement = getAchievementById('month-master')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should unlock with longestStreak of 30 even if current is lower', () => {
      const stats = createStats({ currentStreak: 5, longestStreak: 30 })
      const achievement = getAchievementById('month-master')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock with streaks below 30', () => {
      const stats = createStats({ currentStreak: 29, longestStreak: 29 })
      const achievement = getAchievementById('month-master')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('dedicated', () => {
    it('should unlock with 7 unique days of activity', () => {
      const dailyStats = [
        createDayStats('2024-01-01', 1),
        createDayStats('2024-01-02', 1),
        createDayStats('2024-01-03', 1),
        createDayStats('2024-01-04', 1),
        createDayStats('2024-01-05', 1),
        createDayStats('2024-01-06', 1),
        createDayStats('2024-01-07', 1),
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('dedicated')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock with only 6 unique days', () => {
      const dailyStats = [
        createDayStats('2024-01-01', 1),
        createDayStats('2024-01-02', 1),
        createDayStats('2024-01-03', 1),
        createDayStats('2024-01-04', 1),
        createDayStats('2024-01-05', 1),
        createDayStats('2024-01-06', 1),
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('dedicated')!
      expect(achievement.condition(stats)).toBe(false)
    })

    it('should count unique days correctly with duplicates', () => {
      // If there are duplicate dates, they should only count once
      const dailyStats = [
        createDayStats('2024-01-01', 1),
        createDayStats('2024-01-01', 2), // Same day, different entry
        createDayStats('2024-01-02', 1),
        createDayStats('2024-01-03', 1),
        createDayStats('2024-01-04', 1),
        createDayStats('2024-01-05', 1),
        createDayStats('2024-01-06', 1),
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('dedicated')!
      // Only 6 unique days, so should not unlock
      expect(achievement.condition(stats)).toBe(false)
    })
  })
})

describe('Level Achievements', () => {
  describe('level-apprentice', () => {
    it('should always unlock (starts at 0)', () => {
      const stats = createStats({ totalFocusMinutes: 0 })
      const achievement = getAchievementById('level-apprentice')!
      expect(achievement.condition(stats)).toBe(true)
    })
  })

  describe('level-craftsman', () => {
    it('should unlock at 25 hours (1500 minutes)', () => {
      const stats = createStats({ totalFocusMinutes: 25 * 60 })
      const achievement = getAchievementById('level-craftsman')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock below 25 hours', () => {
      const stats = createStats({ totalFocusMinutes: 25 * 60 - 1 })
      const achievement = getAchievementById('level-craftsman')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('level-master', () => {
    it('should unlock at 100 hours (6000 minutes)', () => {
      const stats = createStats({ totalFocusMinutes: 100 * 60 })
      const achievement = getAchievementById('level-master')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock below 100 hours', () => {
      const stats = createStats({ totalFocusMinutes: 100 * 60 - 1 })
      const achievement = getAchievementById('level-master')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('level-grandmaster', () => {
    it('should unlock at 500 hours (30000 minutes)', () => {
      const stats = createStats({ totalFocusMinutes: 500 * 60 })
      const achievement = getAchievementById('level-grandmaster')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock below 500 hours', () => {
      const stats = createStats({ totalFocusMinutes: 500 * 60 - 1 })
      const achievement = getAchievementById('level-grandmaster')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })
})

describe('Special Achievements', () => {
  describe('early-bird', () => {
    it('should unlock when completing pomodoro at 5 AM', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 5,
      }
      const achievement = getAchievementById('early-bird')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should unlock when completing pomodoro at 6 AM', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 6,
      }
      const achievement = getAchievementById('early-bird')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should not unlock at 7 AM (exclusive)', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 7,
      }
      const achievement = getAchievementById('early-bird')!
      expect(achievement.condition(stats, context)).toBe(false)
    })

    it('should not unlock at 4 AM', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 4,
      }
      const achievement = getAchievementById('early-bird')!
      expect(achievement.condition(stats, context)).toBe(false)
    })

    it('should not unlock without justCompletedPomodoro', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: false,
        currentHour: 6,
      }
      const achievement = getAchievementById('early-bird')!
      expect(achievement.condition(stats, context)).toBe(false)
    })

    it('should not unlock without context', () => {
      const stats = createStats()
      const achievement = getAchievementById('early-bird')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('night-owl', () => {
    it('should unlock when completing pomodoro at 10 PM (22)', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 22,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should unlock when completing pomodoro at 11 PM (23)', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 23,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should unlock when completing pomodoro at midnight (0)', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 0,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should unlock when completing pomodoro at 1 AM', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 1,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should not unlock at 2 AM (exclusive)', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 2,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(false)
    })

    it('should not unlock at 9 PM (21)', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: true,
        currentHour: 21,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(false)
    })

    it('should not unlock without justCompletedPomodoro', () => {
      const stats = createStats()
      const context: AchievementContext = {
        justCompletedPomodoro: false,
        currentHour: 23,
      }
      const achievement = getAchievementById('night-owl')!
      expect(achievement.condition(stats, context)).toBe(false)
    })
  })

  describe('marathon', () => {
    it('should unlock with 5 session pomodoros', () => {
      const stats = createStats()
      const context: AchievementContext = { sessionPomodoros: 5 }
      const achievement = getAchievementById('marathon')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should unlock with more than 5 session pomodoros', () => {
      const stats = createStats()
      const context: AchievementContext = { sessionPomodoros: 10 }
      const achievement = getAchievementById('marathon')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should not unlock with 4 session pomodoros', () => {
      const stats = createStats()
      const context: AchievementContext = { sessionPomodoros: 4 }
      const achievement = getAchievementById('marathon')!
      expect(achievement.condition(stats, context)).toBe(false)
    })

    it('should not unlock without context', () => {
      const stats = createStats()
      const achievement = getAchievementById('marathon')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('speed-demon', () => {
    it('should unlock with 3 session pomodoros', () => {
      const stats = createStats()
      const context: AchievementContext = { sessionPomodoros: 3 }
      const achievement = getAchievementById('speed-demon')!
      expect(achievement.condition(stats, context)).toBe(true)
    })

    it('should not unlock with 2 session pomodoros', () => {
      const stats = createStats()
      const context: AchievementContext = { sessionPomodoros: 2 }
      const achievement = getAchievementById('speed-demon')!
      expect(achievement.condition(stats, context)).toBe(false)
    })
  })

  describe('perfect-day', () => {
    it('should unlock with 8 pomodoros in a single day', () => {
      const dailyStats = [createDayStats('2024-01-15', 8)]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('perfect-day')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should unlock if any day has 8+ pomodoros', () => {
      const dailyStats = [
        createDayStats('2024-01-14', 3),
        createDayStats('2024-01-15', 10),
        createDayStats('2024-01-16', 2),
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('perfect-day')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock with 7 pomodoros max', () => {
      const dailyStats = [
        createDayStats('2024-01-14', 7),
        createDayStats('2024-01-15', 5),
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('perfect-day')!
      expect(achievement.condition(stats)).toBe(false)
    })

    it('should not unlock with empty stats', () => {
      const stats = createStats()
      const achievement = getAchievementById('perfect-day')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })

  describe('productive-week', () => {
    it('should unlock with 25 pomodoros in a week', () => {
      // All in the same week (Sunday Jan 14, 2024 week)
      const dailyStats = [
        createDayStats('2024-01-14', 5), // Sunday
        createDayStats('2024-01-15', 5), // Monday
        createDayStats('2024-01-16', 5), // Tuesday
        createDayStats('2024-01-17', 5), // Wednesday
        createDayStats('2024-01-18', 5), // Thursday
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('productive-week')!
      expect(achievement.condition(stats)).toBe(true)
    })

    it('should not unlock with 24 pomodoros in a week', () => {
      const dailyStats = [
        createDayStats('2024-01-14', 5),
        createDayStats('2024-01-15', 5),
        createDayStats('2024-01-16', 5),
        createDayStats('2024-01-17', 5),
        createDayStats('2024-01-18', 4),
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('productive-week')!
      expect(achievement.condition(stats)).toBe(false)
    })

    it('should not count pomodoros from different weeks', () => {
      // Split across two weeks
      const dailyStats = [
        createDayStats('2024-01-13', 15), // Saturday (week 1)
        createDayStats('2024-01-14', 10), // Sunday (week 2 starts)
      ]
      const stats = createStats({ dailyStats })
      const achievement = getAchievementById('productive-week')!
      expect(achievement.condition(stats)).toBe(false)
    })
  })
})

describe('checkNewAchievements', () => {
  it('should return newly unlocked achievements', () => {
    const stats = createStats({ totalPomodoros: 1 })
    const unlockedIds: string[] = []

    const newAchievements = checkNewAchievements(stats, unlockedIds)

    // Should include first-focus and level-apprentice
    expect(newAchievements.map((a) => a.id)).toContain('first-focus')
    expect(newAchievements.map((a) => a.id)).toContain('level-apprentice')
  })

  it('should not return already unlocked achievements', () => {
    const stats = createStats({ totalPomodoros: 10 })
    const unlockedIds = ['first-focus', 'getting-started']

    const newAchievements = checkNewAchievements(stats, unlockedIds)

    expect(newAchievements.map((a) => a.id)).not.toContain('first-focus')
    expect(newAchievements.map((a) => a.id)).not.toContain('getting-started')
  })

  it('should pass context to achievement conditions', () => {
    const stats = createStats()
    const unlockedIds: string[] = []
    const context: AchievementContext = {
      justCompletedPomodoro: true,
      currentHour: 6,
    }

    const newAchievements = checkNewAchievements(stats, unlockedIds, context)

    expect(newAchievements.map((a) => a.id)).toContain('early-bird')
  })

  it('should return empty array when no new achievements', () => {
    const stats = createStats({ totalPomodoros: 0 })
    const unlockedIds = ['level-apprentice'] // The only one that unlocks at 0

    const newAchievements = checkNewAchievements(stats, unlockedIds)

    expect(newAchievements).toHaveLength(0)
  })

  it('should return multiple achievements at once', () => {
    const stats = createStats({
      totalPomodoros: 10,
      currentStreak: 3,
      longestStreak: 3,
    })
    const unlockedIds: string[] = []

    const newAchievements = checkNewAchievements(stats, unlockedIds)

    // Should include first-focus, getting-started, streak-starter, level-apprentice
    expect(newAchievements.length).toBeGreaterThanOrEqual(4)
    expect(newAchievements.map((a) => a.id)).toContain('first-focus')
    expect(newAchievements.map((a) => a.id)).toContain('getting-started')
    expect(newAchievements.map((a) => a.id)).toContain('streak-starter')
  })
})

describe('getAllAchievements', () => {
  it('should return all achievements with unlocked status', () => {
    const unlockedIds = ['first-focus', 'level-apprentice']
    const result = getAllAchievements(unlockedIds)

    expect(result).toHaveLength(ACHIEVEMENTS.length)
    expect(result.every((a) => 'unlocked' in a)).toBe(true)
  })

  it('should mark unlocked achievements correctly', () => {
    const unlockedIds = ['first-focus', 'level-apprentice']
    const result = getAllAchievements(unlockedIds)

    const firstFocus = result.find((a) => a.id === 'first-focus')
    const gettingStarted = result.find((a) => a.id === 'getting-started')

    expect(firstFocus?.unlocked).toBe(true)
    expect(gettingStarted?.unlocked).toBe(false)
  })

  it('should handle empty unlockedIds', () => {
    const result = getAllAchievements([])

    expect(result.every((a) => a.unlocked === false)).toBe(true)
  })

  it('should handle all achievements unlocked', () => {
    const unlockedIds = ACHIEVEMENTS.map((a) => a.id)
    const result = getAllAchievements(unlockedIds)

    expect(result.every((a) => a.unlocked === true)).toBe(true)
  })
})

describe('getAchievementById', () => {
  it('should return achievement by ID', () => {
    const result = getAchievementById('first-focus')

    expect(result).toBeDefined()
    expect(result?.id).toBe('first-focus')
    expect(result?.name).toBe('First Focus')
  })

  it('should return undefined for unknown ID', () => {
    const result = getAchievementById('unknown-achievement')

    expect(result).toBeUndefined()
  })

  it('should return achievement with all properties', () => {
    const result = getAchievementById('streak-starter')

    expect(result).toMatchObject({
      id: 'streak-starter',
      name: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: '/ghosts/ghost-fire.webp',
      category: 'streak',
    })
  })
})

describe('getUnlockedCount', () => {
  it('should return correct counts', () => {
    const unlockedIds = ['first-focus', 'level-apprentice', 'streak-starter']
    const result = getUnlockedCount(unlockedIds)

    expect(result.unlocked).toBe(3)
    expect(result.total).toBe(ACHIEVEMENTS.length)
  })

  it('should return 0 unlocked for empty array', () => {
    const result = getUnlockedCount([])

    expect(result.unlocked).toBe(0)
    expect(result.total).toBe(ACHIEVEMENTS.length)
  })

  it('should return all unlocked when all are unlocked', () => {
    const unlockedIds = ACHIEVEMENTS.map((a) => a.id)
    const result = getUnlockedCount(unlockedIds)

    expect(result.unlocked).toBe(ACHIEVEMENTS.length)
    expect(result.total).toBe(ACHIEVEMENTS.length)
  })
})
