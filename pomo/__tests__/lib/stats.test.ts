import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateStreak,
  calculatePersonalRecords,
  calculateFocusScore,
  calculateLevel,
  calculateGoalProgress,
  generateHeatmapData,
  getTodayStats,
  formatTotalTime,
  addCompletedPomodoro,
  addSkippedPomodoro,
} from '@/lib/stats'
import type { DayStats, Stats, Goals } from '@/lib/types'

// Helper to create a date string in YYYY-MM-DD format
function dateStr(daysAgo: number, baseDateStr: string = '2024-01-15'): string {
  const [year, month, day] = baseDateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) // Local time, not UTC
  date.setDate(date.getDate() - daysAgo)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Helper to create a DayStats object
function createDayStats(
  daysAgo: number,
  completed: number = 1,
  skipped: number = 0,
  baseDateStr: string = '2024-01-15'
): DayStats {
  return {
    date: dateStr(daysAgo, baseDateStr),
    completedPomodoros: completed,
    skippedPomodoros: skipped,
    focusMinutes: completed * 25,
  }
}

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

describe('calculateStreak', () => {
  const today = '2024-01-15'

  describe('when dailyStats is empty', () => {
    it('should return 0', () => {
      expect(calculateStreak([], today)).toBe(0)
    })
  })

  describe('when there is no activity today or yesterday', () => {
    it('should return 0', () => {
      const dailyStats: DayStats[] = [createDayStats(5)] // 5 days ago
      expect(calculateStreak(dailyStats, today)).toBe(0)
    })
  })

  describe('when there is activity only today', () => {
    it('should return 1', () => {
      const dailyStats: DayStats[] = [createDayStats(0)] // today
      expect(calculateStreak(dailyStats, today)).toBe(1)
    })
  })

  describe('when there is activity only yesterday', () => {
    it('should return 1', () => {
      const dailyStats: DayStats[] = [createDayStats(1)] // yesterday
      expect(calculateStreak(dailyStats, today)).toBe(1)
    })
  })

  describe('when there are consecutive days', () => {
    it('should count all consecutive days from today', () => {
      const dailyStats: DayStats[] = [
        createDayStats(0), // today
        createDayStats(1), // yesterday
        createDayStats(2), // 2 days ago
      ]
      expect(calculateStreak(dailyStats, today)).toBe(3)
    })

    it('should count consecutive days from yesterday if no activity today', () => {
      const dailyStats: DayStats[] = [
        createDayStats(1), // yesterday
        createDayStats(2), // 2 days ago
        createDayStats(3), // 3 days ago
      ]
      expect(calculateStreak(dailyStats, today)).toBe(3)
    })
  })

  describe('when there is a gap in activity', () => {
    it('should stop counting at the gap', () => {
      const dailyStats: DayStats[] = [
        createDayStats(0), // today
        createDayStats(1), // yesterday
        // gap at 2 days ago
        createDayStats(3), // 3 days ago
      ]
      expect(calculateStreak(dailyStats, today)).toBe(2)
    })
  })

  describe('when there are days with 0 completed pomodoros', () => {
    it('should not count days with 0 completed', () => {
      const dailyStats: DayStats[] = [
        createDayStats(0), // today with completed
        { date: dateStr(1), completedPomodoros: 0, skippedPomodoros: 1, focusMinutes: 0 }, // yesterday skipped only
      ]
      expect(calculateStreak(dailyStats, today)).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle unsorted input', () => {
      const dailyStats: DayStats[] = [
        createDayStats(2),
        createDayStats(0),
        createDayStats(1),
      ]
      expect(calculateStreak(dailyStats, today)).toBe(3)
    })

    it('should handle long streaks', () => {
      const dailyStats: DayStats[] = Array.from({ length: 30 }, (_, i) =>
        createDayStats(i)
      )
      expect(calculateStreak(dailyStats, today)).toBe(30)
    })
  })
})

describe('calculatePersonalRecords', () => {
  describe('when dailyStats is empty', () => {
    it('should return null for both records', () => {
      const result = calculatePersonalRecords([])
      expect(result.mostProductiveDay).toBeNull()
      expect(result.mostProductiveWeek).toBeNull()
    })
  })

  describe('mostProductiveDay', () => {
    it('should find the day with most pomodoros', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-10', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
        { date: '2024-01-11', completedPomodoros: 8, skippedPomodoros: 0, focusMinutes: 200 },
        { date: '2024-01-12', completedPomodoros: 3, skippedPomodoros: 0, focusMinutes: 75 },
      ]
      const result = calculatePersonalRecords(dailyStats)
      expect(result.mostProductiveDay).toEqual({ date: '2024-01-11', pomodoros: 8 })
    })

    it('should pick the last day when there are ties', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-10', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
        { date: '2024-01-11', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
      ]
      const result = calculatePersonalRecords(dailyStats)
      // The forEach loop keeps the last one with equal value
      expect(result.mostProductiveDay?.pomodoros).toBe(5)
    })
  })

  describe('mostProductiveWeek', () => {
    it('should find the week with most pomodoros', () => {
      const dailyStats: DayStats[] = [
        // Week 1 (starting Sunday 2024-01-07)
        { date: '2024-01-08', completedPomodoros: 3, skippedPomodoros: 0, focusMinutes: 75 },
        { date: '2024-01-09', completedPomodoros: 2, skippedPomodoros: 0, focusMinutes: 50 },
        // Week 2 (starting Sunday 2024-01-14)
        { date: '2024-01-15', completedPomodoros: 10, skippedPomodoros: 0, focusMinutes: 250 },
      ]
      const result = calculatePersonalRecords(dailyStats)
      expect(result.mostProductiveWeek?.pomodoros).toBe(10)
    })

    it('should aggregate pomodoros within the same week', () => {
      const dailyStats: DayStats[] = [
        // All in the same week (starting Sunday 2024-01-14)
        { date: '2024-01-15', completedPomodoros: 3, skippedPomodoros: 0, focusMinutes: 75 },
        { date: '2024-01-16', completedPomodoros: 4, skippedPomodoros: 0, focusMinutes: 100 },
        { date: '2024-01-17', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
      ]
      const result = calculatePersonalRecords(dailyStats)
      expect(result.mostProductiveWeek?.pomodoros).toBe(12)
    })
  })
})

describe('calculateFocusScore', () => {
  describe('when there are no pomodoros', () => {
    it('should return 100 (neutral score)', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 0,
        skippedPomodoros: 0,
        focusMinutes: 0,
      }
      expect(calculateFocusScore(todayStats, 0)).toBe(100)
    })
  })

  describe('when all pomodoros are completed', () => {
    it('should return 100', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 5,
        skippedPomodoros: 0,
        focusMinutes: 125,
      }
      expect(calculateFocusScore(todayStats, 0)).toBe(100)
    })
  })

  describe('when all pomodoros are skipped', () => {
    it('should return 0', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 0,
        skippedPomodoros: 5,
        focusMinutes: 0,
      }
      expect(calculateFocusScore(todayStats, 0)).toBe(0)
    })
  })

  describe('when there is a mix of completed and skipped', () => {
    it('should calculate correct percentage', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 3,
        skippedPomodoros: 1,
        focusMinutes: 75,
      }
      // 3/4 = 75%
      expect(calculateFocusScore(todayStats, 0)).toBe(75)
    })
  })

  describe('streak bonuses', () => {
    it('should add +5 bonus at streak 3', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 4,
        skippedPomodoros: 1,
        focusMinutes: 100,
      }
      // 4/5 = 80%, + 5 for streak 3 = 85
      expect(calculateFocusScore(todayStats, 3)).toBe(85)
    })

    it('should add +10 bonus at streak 7 (5+5)', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 4,
        skippedPomodoros: 1,
        focusMinutes: 100,
      }
      // 4/5 = 80%, + 5 + 5 = 90
      expect(calculateFocusScore(todayStats, 7)).toBe(90)
    })

    it('should cap score at 100', () => {
      const todayStats: DayStats = {
        date: '2024-01-15',
        completedPomodoros: 10,
        skippedPomodoros: 0,
        focusMinutes: 250,
      }
      // 100% + streak bonuses should still be 100
      expect(calculateFocusScore(todayStats, 10)).toBe(100)
    })
  })
})

describe('calculateLevel', () => {
  describe('Apprentice tier (0-25 hours)', () => {
    it('should return Apprentice at 0 minutes', () => {
      const result = calculateLevel(0)
      expect(result.name).toBe('Apprentice')
      expect(result.tier).toBe(1)
      expect(result.progress).toBe(0)
      expect(result.nextTier).toBe(25)
    })

    it('should return Apprentice at 12 hours with 48% progress', () => {
      // calculateLevel uses Math.floor for hours, so 750 min = 12 hours
      // Progress = (12/25) * 100 = 48
      const result = calculateLevel(12 * 60) // 12 hours = 720 minutes
      expect(result.name).toBe('Apprentice')
      expect(result.tier).toBe(1)
      expect(result.progress).toBe(48)
      expect(result.nextTier).toBe(25)
    })

    it('should return Apprentice at 24 hours', () => {
      const result = calculateLevel(24 * 60)
      expect(result.name).toBe('Apprentice')
      expect(result.tier).toBe(1)
    })
  })

  describe('Craftsman tier (25-100 hours)', () => {
    it('should return Craftsman at exactly 25 hours', () => {
      const result = calculateLevel(25 * 60)
      expect(result.name).toBe('Craftsman')
      expect(result.tier).toBe(2)
      expect(result.nextTier).toBe(100)
    })

    it('should calculate progress within Craftsman tier', () => {
      const result = calculateLevel(50 * 60) // 50 hours
      expect(result.name).toBe('Craftsman')
      expect(result.tier).toBe(2)
      // Progress: (50 - 25) / 0.75 = 33.33...
      expect(result.progress).toBeCloseTo(33.33, 1)
    })
  })

  describe('Master tier (100-500 hours)', () => {
    it('should return Master at exactly 100 hours', () => {
      const result = calculateLevel(100 * 60)
      expect(result.name).toBe('Master')
      expect(result.tier).toBe(3)
      expect(result.nextTier).toBe(500)
    })

    it('should calculate progress within Master tier', () => {
      const result = calculateLevel(200 * 60) // 200 hours
      expect(result.name).toBe('Master')
      expect(result.tier).toBe(3)
      // Progress: (200 - 100) / 4 = 25
      expect(result.progress).toBe(25)
    })
  })

  describe('Grandmaster tier (500+ hours)', () => {
    it('should return Grandmaster at exactly 500 hours', () => {
      const result = calculateLevel(500 * 60)
      expect(result.name).toBe('Grandmaster')
      expect(result.tier).toBe(4)
      expect(result.progress).toBe(100)
      expect(result.nextTier).toBeNull()
    })

    it('should return Grandmaster at 1000 hours', () => {
      const result = calculateLevel(1000 * 60)
      expect(result.name).toBe('Grandmaster')
      expect(result.tier).toBe(4)
      expect(result.progress).toBe(100)
      expect(result.nextTier).toBeNull()
    })
  })
})

describe('calculateGoalProgress', () => {
  const today = '2024-01-15' // Monday

  describe('when goals are null', () => {
    it('should return null percentages', () => {
      const goals: Goals = { dailyPomodoros: null, weeklyPomodoros: null }
      const result = calculateGoalProgress([], goals, today)
      expect(result.daily.percentage).toBeNull()
      expect(result.weekly.percentage).toBeNull()
    })
  })

  describe('daily goal progress', () => {
    it('should calculate 0% when no pomodoros today', () => {
      const goals: Goals = { dailyPomodoros: 8, weeklyPomodoros: null }
      const result = calculateGoalProgress([], goals, today)
      expect(result.daily.current).toBe(0)
      expect(result.daily.target).toBe(8)
      expect(result.daily.percentage).toBe(0)
    })

    it('should calculate correct percentage', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-15', completedPomodoros: 4, skippedPomodoros: 0, focusMinutes: 100 },
      ]
      const goals: Goals = { dailyPomodoros: 8, weeklyPomodoros: null }
      const result = calculateGoalProgress(dailyStats, goals, today)
      expect(result.daily.current).toBe(4)
      expect(result.daily.percentage).toBe(50)
    })

    it('should cap at 100% when exceeded', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-15', completedPomodoros: 10, skippedPomodoros: 0, focusMinutes: 250 },
      ]
      const goals: Goals = { dailyPomodoros: 8, weeklyPomodoros: null }
      const result = calculateGoalProgress(dailyStats, goals, today)
      expect(result.daily.percentage).toBe(100)
    })
  })

  describe('weekly goal progress', () => {
    it('should aggregate pomodoros from current week', () => {
      // 2024-01-15 is Monday, week starts Sunday 2024-01-14
      const dailyStats: DayStats[] = [
        { date: '2024-01-14', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 }, // Sunday
        { date: '2024-01-15', completedPomodoros: 3, skippedPomodoros: 0, focusMinutes: 75 }, // Monday
        { date: '2024-01-10', completedPomodoros: 10, skippedPomodoros: 0, focusMinutes: 250 }, // Last week
      ]
      const goals: Goals = { dailyPomodoros: null, weeklyPomodoros: 25 }
      const result = calculateGoalProgress(dailyStats, goals, today)
      expect(result.weekly.current).toBe(8) // 5 + 3 from this week
      expect(result.weekly.percentage).toBe(32) // 8/25 * 100
    })

    it('should cap at 100% when exceeded', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-14', completedPomodoros: 15, skippedPomodoros: 0, focusMinutes: 375 },
        { date: '2024-01-15', completedPomodoros: 15, skippedPomodoros: 0, focusMinutes: 375 },
      ]
      const goals: Goals = { dailyPomodoros: null, weeklyPomodoros: 25 }
      const result = calculateGoalProgress(dailyStats, goals, today)
      expect(result.weekly.percentage).toBe(100)
    })
  })
})

describe('generateHeatmapData', () => {
  const baseDate = new Date('2024-01-15')

  it('should generate 181 days of data', () => {
    const result = generateHeatmapData([], baseDate)
    expect(result[0]).toHaveLength(181)
  })

  it('should end with today\'s date', () => {
    const result = generateHeatmapData([], baseDate)
    const lastDay = result[0][result[0].length - 1]
    expect(lastDay.date).toBe('2024-01-15')
  })

  it('should start 180 days before today', () => {
    const result = generateHeatmapData([], baseDate)
    const firstDay = result[0][0]
    expect(firstDay.date).toBe('2023-07-19')
  })

  describe('activity levels', () => {
    it('should return level 0 for no activity', () => {
      const result = generateHeatmapData([], baseDate)
      expect(result[0][result[0].length - 1].level).toBe(0)
    })

    it('should return level 1 for 1-2 pomodoros', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-15', completedPomodoros: 1, skippedPomodoros: 0, focusMinutes: 25 },
      ]
      const result = generateHeatmapData(dailyStats, baseDate)
      expect(result[0][result[0].length - 1].level).toBe(1)
    })

    it('should return level 2 for 3-4 pomodoros', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-15', completedPomodoros: 3, skippedPomodoros: 0, focusMinutes: 75 },
      ]
      const result = generateHeatmapData(dailyStats, baseDate)
      expect(result[0][result[0].length - 1].level).toBe(2)
    })

    it('should return level 3 for 5-7 pomodoros', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-15', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
      ]
      const result = generateHeatmapData(dailyStats, baseDate)
      expect(result[0][result[0].length - 1].level).toBe(3)
    })

    it('should return level 4 for 8+ pomodoros', () => {
      const dailyStats: DayStats[] = [
        { date: '2024-01-15', completedPomodoros: 8, skippedPomodoros: 0, focusMinutes: 200 },
      ]
      const result = generateHeatmapData(dailyStats, baseDate)
      expect(result[0][result[0].length - 1].level).toBe(4)
    })
  })

  it('should include count in each day', () => {
    const dailyStats: DayStats[] = [
      { date: '2024-01-15', completedPomodoros: 5, skippedPomodoros: 2, focusMinutes: 125 },
    ]
    const result = generateHeatmapData(dailyStats, baseDate)
    expect(result[0][result[0].length - 1].count).toBe(5)
  })
})

describe('getTodayStats', () => {
  it('should return existing stats for today', () => {
    const dailyStats: DayStats[] = [
      { date: '2024-01-15', completedPomodoros: 5, skippedPomodoros: 1, focusMinutes: 125 },
    ]
    const result = getTodayStats(dailyStats, '2024-01-15')
    expect(result.completedPomodoros).toBe(5)
    expect(result.skippedPomodoros).toBe(1)
  })

  it('should return default stats if no data for today', () => {
    const dailyStats: DayStats[] = [
      { date: '2024-01-14', completedPomodoros: 5, skippedPomodoros: 1, focusMinutes: 125 },
    ]
    const result = getTodayStats(dailyStats, '2024-01-15')
    expect(result.date).toBe('2024-01-15')
    expect(result.completedPomodoros).toBe(0)
    expect(result.skippedPomodoros).toBe(0)
    expect(result.focusMinutes).toBe(0)
  })

  it('should return default stats for empty array', () => {
    const result = getTodayStats([], '2024-01-15')
    expect(result.completedPomodoros).toBe(0)
  })
})

describe('formatTotalTime', () => {
  it('should format 0 minutes correctly', () => {
    const result = formatTotalTime(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.total).toBe(0)
  })

  it('should format minutes only', () => {
    const result = formatTotalTime(45)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(45)
    expect(result.total).toBe(45)
  })

  it('should format hours only', () => {
    const result = formatTotalTime(120)
    expect(result.hours).toBe(2)
    expect(result.minutes).toBe(0)
    expect(result.total).toBe(120)
  })

  it('should format hours and minutes', () => {
    const result = formatTotalTime(150)
    expect(result.hours).toBe(2)
    expect(result.minutes).toBe(30)
    expect(result.total).toBe(150)
  })

  it('should handle large values', () => {
    const result = formatTotalTime(10000) // 166 hours 40 minutes
    expect(result.hours).toBe(166)
    expect(result.minutes).toBe(40)
  })
})

describe('addCompletedPomodoro', () => {
  const today = '2024-01-15'

  describe('when adding to a new day', () => {
    it('should create a new daily entry', () => {
      const stats = createStats()
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.dailyStats).toHaveLength(1)
      expect(result.dailyStats[0].date).toBe(today)
      expect(result.dailyStats[0].completedPomodoros).toBe(1)
      expect(result.dailyStats[0].focusMinutes).toBe(25)
    })

    it('should update totals', () => {
      const stats = createStats()
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.totalPomodoros).toBe(1)
      expect(result.totalFocusMinutes).toBe(25)
    })

    it('should set lastActiveDate', () => {
      const stats = createStats()
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.lastActiveDate).toBe(today)
    })
  })

  describe('when adding to an existing day', () => {
    it('should increment existing entry', () => {
      const stats = createStats({
        dailyStats: [
          { date: today, completedPomodoros: 2, skippedPomodoros: 0, focusMinutes: 50 },
        ],
      })
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.dailyStats).toHaveLength(1)
      expect(result.dailyStats[0].completedPomodoros).toBe(3)
      expect(result.dailyStats[0].focusMinutes).toBe(75)
    })

    it('should preserve other days', () => {
      const yesterday = '2024-01-14'
      const stats = createStats({
        dailyStats: [
          { date: yesterday, completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
          { date: today, completedPomodoros: 2, skippedPomodoros: 0, focusMinutes: 50 },
        ],
      })
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.dailyStats).toHaveLength(2)
      expect(result.dailyStats.find((d) => d.date === yesterday)?.completedPomodoros).toBe(5)
    })
  })

  describe('streak updates', () => {
    it('should calculate correct streak for first pomodoro', () => {
      const stats = createStats()
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.currentStreak).toBe(1)
    })

    it('should calculate streak with consecutive days', () => {
      const yesterday = '2024-01-14'
      const stats = createStats({
        dailyStats: [
          { date: yesterday, completedPomodoros: 3, skippedPomodoros: 0, focusMinutes: 75 },
        ],
        currentStreak: 1,
        longestStreak: 1,
      })
      const result = addCompletedPomodoro(stats, 25, today)

      expect(result.currentStreak).toBe(2)
    })

    it('should update longest streak if exceeded', () => {
      const stats = createStats({ longestStreak: 5 })
      // Add 6 consecutive days of activity
      let result = stats
      for (let i = 5; i >= 0; i--) {
        result = addCompletedPomodoro(result, 25, dateStr(i, today))
      }

      expect(result.longestStreak).toBe(6)
    })
  })

  describe('personal records updates', () => {
    it('should update most productive day', () => {
      const stats = createStats({
        dailyStats: [
          { date: '2024-01-14', completedPomodoros: 5, skippedPomodoros: 0, focusMinutes: 125 },
        ],
      })
      // Add 6 to today
      let result = stats
      for (let i = 0; i < 6; i++) {
        result = addCompletedPomodoro(result, 25, today)
      }

      expect(result.personalRecords.mostProductiveDay).toEqual({
        date: today,
        pomodoros: 6,
      })
    })
  })

  describe('immutability', () => {
    it('should not mutate the original stats', () => {
      const stats = createStats()
      const originalDailyStats = stats.dailyStats
      addCompletedPomodoro(stats, 25, today)

      expect(stats.dailyStats).toBe(originalDailyStats)
      expect(stats.totalPomodoros).toBe(0)
    })
  })
})

describe('addSkippedPomodoro', () => {
  const today = '2024-01-15'

  describe('when adding to a new day', () => {
    it('should create a new daily entry', () => {
      const stats = createStats()
      const result = addSkippedPomodoro(stats, today)

      expect(result.dailyStats).toHaveLength(1)
      expect(result.dailyStats[0].date).toBe(today)
      expect(result.dailyStats[0].skippedPomodoros).toBe(1)
      expect(result.dailyStats[0].completedPomodoros).toBe(0)
    })

    it('should set lastActiveDate', () => {
      const stats = createStats()
      const result = addSkippedPomodoro(stats, today)

      expect(result.lastActiveDate).toBe(today)
    })
  })

  describe('when adding to an existing day', () => {
    it('should increment skipped count', () => {
      const stats = createStats({
        dailyStats: [
          { date: today, completedPomodoros: 2, skippedPomodoros: 1, focusMinutes: 50 },
        ],
      })
      const result = addSkippedPomodoro(stats, today)

      expect(result.dailyStats[0].skippedPomodoros).toBe(2)
      expect(result.dailyStats[0].completedPomodoros).toBe(2) // unchanged
    })
  })

  describe('should NOT affect', () => {
    it('total pomodoros', () => {
      const stats = createStats({ totalPomodoros: 10 })
      const result = addSkippedPomodoro(stats, today)

      expect(result.totalPomodoros).toBe(10)
    })

    it('total focus minutes', () => {
      const stats = createStats({ totalFocusMinutes: 250 })
      const result = addSkippedPomodoro(stats, today)

      expect(result.totalFocusMinutes).toBe(250)
    })

    it('streaks', () => {
      const stats = createStats({ currentStreak: 5, longestStreak: 10 })
      const result = addSkippedPomodoro(stats, today)

      expect(result.currentStreak).toBe(5)
      expect(result.longestStreak).toBe(10)
    })
  })

  describe('immutability', () => {
    it('should not mutate the original stats', () => {
      const stats = createStats()
      const originalDailyStats = stats.dailyStats
      addSkippedPomodoro(stats, today)

      expect(stats.dailyStats).toBe(originalDailyStats)
    })
  })
})
