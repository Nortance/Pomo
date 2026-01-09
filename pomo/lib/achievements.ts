/**
 * Achievement system for CodeFocus
 * Defines all achievements and their unlock conditions
 */

import type { Stats, DayStats } from './types'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string // Path to ghost icon
  category: 'milestone' | 'streak' | 'level' | 'special'
  condition: (stats: Stats, context?: AchievementContext) => boolean
}

export interface AchievementContext {
  currentHour?: number // For time-based achievements
  sessionPomodoros?: number // For session-based achievements
  justCompletedPomodoro?: boolean
  previousLevel?: number
  currentLevel?: number
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string // ISO date string
}

// All achievements in the game
export const ACHIEVEMENTS: Achievement[] = [
  // === MILESTONE ACHIEVEMENTS ===
  {
    id: 'first-focus',
    name: 'First Focus',
    description: 'Complete your first pomodoro',
    icon: '/ghosts/ghost-baby.webp',
    category: 'milestone',
    condition: (stats) => stats.totalPomodoros >= 1,
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 10 pomodoros',
    icon: '/ghosts/ghost-trophy.webp',
    category: 'milestone',
    condition: (stats) => stats.totalPomodoros >= 10,
  },
  {
    id: 'half-century',
    name: 'Half Century',
    description: 'Complete 50 pomodoros',
    icon: '/ghosts/ghost-trophy.webp',
    category: 'milestone',
    condition: (stats) => stats.totalPomodoros >= 50,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 pomodoros',
    icon: '/ghosts/ghost-trophy.webp',
    category: 'milestone',
    condition: (stats) => stats.totalPomodoros >= 100,
  },
  {
    id: 'focus-legend',
    name: 'Focus Legend',
    description: 'Complete 500 pomodoros',
    icon: '/ghosts/ghost-trophy.webp',
    category: 'milestone',
    condition: (stats) => stats.totalPomodoros >= 500,
  },

  // === STREAK ACHIEVEMENTS ===
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: '/ghosts/ghost-fire.webp',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '/ghosts/ghost-fire.webp',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '/ghosts/ghost-fire.webp',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 30 || stats.longestStreak >= 30,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Use CodeFocus for 7 different days',
    icon: '/ghosts/ghost-heart.webp',
    category: 'streak',
    condition: (stats) => {
      const uniqueDays = new Set(stats.dailyStats.map((d) => d.date))
      return uniqueDays.size >= 7
    },
  },

  // === LEVEL ACHIEVEMENTS ===
  {
    id: 'level-apprentice',
    name: 'Apprentice',
    description: 'Reach Apprentice level',
    icon: '/ghosts/ghost-apprentice.webp',
    category: 'level',
    condition: (stats) => stats.totalFocusMinutes >= 0, // Everyone starts here
  },
  {
    id: 'level-craftsman',
    name: 'Craftsman',
    description: 'Reach Craftsman level (25 hours)',
    icon: '/ghosts/ghost-craftsman.webp',
    category: 'level',
    condition: (stats) => stats.totalFocusMinutes >= 25 * 60,
  },
  {
    id: 'level-master',
    name: 'Master',
    description: 'Reach Master level (100 hours)',
    icon: '/ghosts/ghost-master.webp',
    category: 'level',
    condition: (stats) => stats.totalFocusMinutes >= 100 * 60,
  },
  {
    id: 'level-grandmaster',
    name: 'Grandmaster',
    description: 'Reach Grandmaster level (500 hours)',
    icon: '/ghosts/ghost-grandmaster.webp',
    category: 'level',
    condition: (stats) => stats.totalFocusMinutes >= 500 * 60,
  },

  // === SPECIAL ACHIEVEMENTS ===
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a pomodoro between 5-7 AM',
    icon: '/ghosts/ghost-sun.webp',
    category: 'special',
    condition: (_, context) => {
      if (!context?.justCompletedPomodoro || context.currentHour === undefined) return false
      return context.currentHour >= 5 && context.currentHour < 7
    },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a pomodoro between 10 PM - 2 AM',
    icon: '/ghosts/ghost-moon.webp',
    category: 'special',
    condition: (_, context) => {
      if (!context?.justCompletedPomodoro || context.currentHour === undefined) return false
      return context.currentHour >= 22 || context.currentHour < 2
    },
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Complete 5 pomodoros in one session',
    icon: '/ghosts/ghost-running.webp',
    category: 'special',
    condition: (_, context) => {
      return (context?.sessionPomodoros ?? 0) >= 5
    },
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Complete 8 pomodoros in a single day',
    icon: '/ghosts/ghost-star.webp',
    category: 'special',
    condition: (stats) => {
      return stats.dailyStats.some((day) => day.completedPomodoros >= 8)
    },
  },
  {
    id: 'productive-week',
    name: 'Productive Week',
    description: 'Complete 25 pomodoros in a week',
    icon: '/ghosts/ghost-medal.webp',
    category: 'special',
    condition: (stats) => {
      // Check if any week has 25+ pomodoros
      const weeklyTotals = new Map<string, number>()
      stats.dailyStats.forEach((day) => {
        const date = new Date(day.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split('T')[0]
        weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) || 0) + day.completedPomodoros)
      })
      return Array.from(weeklyTotals.values()).some((total) => total >= 25)
    },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 3 pomodoros within 2 hours',
    icon: '/ghosts/ghost-lightning.webp',
    category: 'special',
    condition: (_, context) => {
      // This is simplified - we check if session has 3+ pomodoros
      // A more accurate implementation would track timestamps
      return (context?.sessionPomodoros ?? 0) >= 3
    },
  },
]

/**
 * Check which achievements are newly unlocked
 */
export function checkNewAchievements(
  stats: Stats,
  unlockedIds: string[],
  context?: AchievementContext
): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.id)) return false
    // Check if condition is now met
    return achievement.condition(stats, context)
  })
}

/**
 * Get all achievements with their unlock status
 */
export function getAllAchievements(unlockedIds: string[]): Array<Achievement & { unlocked: boolean }> {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedIds.includes(achievement.id),
  }))
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

/**
 * Get count of unlocked achievements
 */
export function getUnlockedCount(unlockedIds: string[]): { unlocked: number; total: number } {
  return {
    unlocked: unlockedIds.length,
    total: ACHIEVEMENTS.length,
  }
}
