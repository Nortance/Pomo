/**
 * Centralized type definitions for CodeFocus app
 */

// === STATS TYPES ===

export interface DayStats {
  date: string // YYYY-MM-DD format
  completedPomodoros: number
  skippedPomodoros: number
  focusMinutes: number
}

export interface PersonalRecords {
  mostProductiveDay: { date: string; pomodoros: number } | null
  mostProductiveWeek: { startDate: string; pomodoros: number } | null
}

export interface Stats {
  currentStreak: number
  longestStreak: number
  totalFocusMinutes: number
  totalPomodoros: number
  dailyStats: DayStats[]
  lastActiveDate: string | null
  personalRecords: PersonalRecords
}

// === TASK TYPES ===

export interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  note?: string
  completed: boolean
  createdAt: string
}

// === SETTINGS TYPES ===

export interface Settings {
  pomodoro: number
  shortBreak: number
  longBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  longBreakInterval: number
}

// === GOALS TYPES ===

export interface Goals {
  dailyPomodoros: number | null
  weeklyPomodoros: number | null
}

// === APP STATE TYPES ===

export interface PersistedState {
  stats: Stats
  tasks: Task[]
  settings: Settings
  goals: Goals
  version: number // For future migrations
}

// === TIMER TYPES ===

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

export interface TimerState {
  mode: TimerMode
  isRunning: boolean
  timeLeft: number
  startDuration: number // Duration when timer started (for accurate progress/recording)
}

// === COMPUTED TYPES ===

export interface Level {
  name: string
  tier: number
  progress: number
  nextTier: number | null
}

export interface GoalProgress {
  daily: {
    current: number
    target: number | null
    percentage: number | null
  }
  weekly: {
    current: number
    target: number | null
    percentage: number | null
  }
}

export interface HeatmapDay {
  date: string
  count: number
  level: number
}
