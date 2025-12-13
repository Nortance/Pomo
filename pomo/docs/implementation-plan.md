# CodeFocus Architecture Refactor - Implementation Plan

## Overview

**Goal**: Unify the fragmented state model to fix bugs and enable new features.

**Estimated Time**: 2-3 hours

**Risk Level**: Medium (touching core state management)

---

## Phase 1: Foundation (45 min)

### 1.1 Create Type Definitions

**File**: `lib/types.ts`

```typescript
// Centralized type definitions for the entire app

export interface DayStats {
  date: string // YYYY-MM-DD
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

export interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  note?: string
  completed: boolean
  createdAt: string
}

export interface Settings {
  pomodoro: number
  shortBreak: number
  longBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  longBreakInterval: number
}

export interface Goals {
  dailyPomodoros: number | null
  weeklyPomodoros: number | null
}

export interface PersistedState {
  stats: Stats
  tasks: Task[]
  settings: Settings
  goals: Goals
  version: number // For future migrations
}

export interface SessionState {
  timer: {
    mode: 'pomodoro' | 'shortBreak' | 'longBreak'
    isRunning: boolean
    timeLeft: number
  }
  sessionPomodoros: number
  activeTaskId: string | null
}

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
```

**Tasks**:
- [ ] Create `lib/types.ts` with all interfaces
- [ ] Export all types

---

### 1.2 Create Storage Layer

**File**: `lib/storage.ts`

```typescript
import { PersistedState } from './types'

const STORAGE_KEY = 'codefocus-app'
const CURRENT_VERSION = 1

export const defaultPersistedState: PersistedState = {
  stats: {
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
  },
  tasks: [],
  settings: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
  },
  goals: {
    dailyPomodoros: null,
    weeklyPomodoros: null,
  },
  version: CURRENT_VERSION,
}

export function loadState(): PersistedState {
  if (typeof window === 'undefined') return defaultPersistedState

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultPersistedState

    const parsed = JSON.parse(stored)
    return migrateState(parsed)
  } catch {
    return defaultPersistedState
  }
}

export function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function migrateState(state: any): PersistedState {
  // Handle migration from old format
  if (!state.version) {
    // Migrate from old useStats format
    return {
      ...defaultPersistedState,
      stats: {
        ...defaultPersistedState.stats,
        ...state,
        personalRecords: state.personalRecords || defaultPersistedState.stats.personalRecords,
      },
      goals: state.goals || defaultPersistedState.goals,
      version: CURRENT_VERSION,
    }
  }

  // Future migrations go here
  // if (state.version === 1) { migrate to 2 }

  return { ...defaultPersistedState, ...state }
}
```

**Tasks**:
- [ ] Create `lib/storage.ts`
- [ ] Implement `loadState()` with migration support
- [ ] Implement `saveState()`
- [ ] Handle old `codefocus-stats` format migration

---

### 1.3 Create Pure Calculation Functions

**File**: `lib/stats.ts`

```typescript
import { DayStats, Level, GoalProgress, HeatmapDay, PersonalRecords } from './types'

export function getToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function getTodayStats(dailyStats: DayStats[]): DayStats {
  const today = getToday()
  return dailyStats.find(d => d.date === today) || {
    date: today,
    completedPomodoros: 0,
    skippedPomodoros: 0,
    focusMinutes: 0,
  }
}

export function calculateStreak(dailyStats: DayStats[]): number {
  if (dailyStats.length === 0) return 0

  const today = getToday()
  const sortedDays = [...dailyStats]
    .filter(d => d.completedPomodoros > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (sortedDays.length === 0) return 0

  const todayDate = new Date(today)
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  const hasActivityToday = sortedDays.some(d => d.date === today)
  const hasActivityYesterday = sortedDays.some(d => d.date === yesterday)

  if (!hasActivityToday && !hasActivityYesterday) return 0

  let streak = 0
  const checkDate = hasActivityToday ? new Date(todayDate) : new Date(yesterdayDate)

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const dayStats = sortedDays.find(d => d.date === dateStr)

    if (dayStats && dayStats.completedPomodoros > 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function calculateFocusScore(todayStats: DayStats, currentStreak: number): number {
  const total = todayStats.completedPomodoros + todayStats.skippedPomodoros
  if (total === 0) return 100

  const completionRate = todayStats.completedPomodoros / total
  let score = Math.round(completionRate * 100)

  if (currentStreak >= 3) score = Math.min(100, score + 5)
  if (currentStreak >= 7) score = Math.min(100, score + 5)

  return score
}

export function calculateLevel(totalFocusMinutes: number): Level {
  const totalHours = Math.floor(totalFocusMinutes / 60)

  if (totalHours >= 500) return { name: 'Grandmaster', tier: 4, progress: 100, nextTier: null }
  if (totalHours >= 100) return { name: 'Master', tier: 3, progress: (totalHours - 100) / 4, nextTier: 500 }
  if (totalHours >= 25) return { name: 'Craftsman', tier: 2, progress: (totalHours - 25) / 0.75, nextTier: 100 }
  return { name: 'Apprentice', tier: 1, progress: (totalHours / 25) * 100, nextTier: 25 }
}

export function calculateGoalProgress(
  dailyStats: DayStats[],
  goals: { dailyPomodoros: number | null; weeklyPomodoros: number | null }
): GoalProgress {
  const todayStats = getTodayStats(dailyStats)

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  let weeklyTotal = 0
  dailyStats.forEach(day => {
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

export function calculatePersonalRecords(dailyStats: DayStats[]): PersonalRecords {
  let mostProductiveDay = { date: '', pomodoros: 0 }

  dailyStats.forEach(day => {
    if (day.completedPomodoros > mostProductiveDay.pomodoros) {
      mostProductiveDay = { date: day.date, pomodoros: day.completedPomodoros }
    }
  })

  const weeklyMap = new Map<string, number>()
  dailyStats.forEach(day => {
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

export function generateHeatmapData(dailyStats: DayStats[], days: number = 180): HeatmapDay[][] {
  const data: HeatmapDay[] = []
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    const dayStats = dailyStats.find(s => s.date === dateStr)

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

  return [data]
}

export function formatTotalTime(totalMinutes: number): { hours: number; minutes: number } {
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  }
}
```

**Tasks**:
- [ ] Create `lib/stats.ts`
- [ ] Move all calculation functions from `use-stats.ts`
- [ ] Make all functions pure (no side effects)
- [ ] Add JSDoc comments

---

## Phase 2: Unified State Hook (30 min)

### 2.1 Create useAppState Hook

**File**: `hooks/use-app-state.ts`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { PersistedState, DayStats, Task, Settings, Goals } from '@/lib/types'
import { loadState, saveState, defaultPersistedState } from '@/lib/storage'
import {
  getToday,
  getTodayStats,
  calculateStreak,
  calculateFocusScore,
  calculateLevel,
  calculateGoalProgress,
  calculatePersonalRecords,
  generateHeatmapData,
  formatTotalTime,
} from '@/lib/stats'

export function useAppState() {
  const [state, setState] = useState<PersistedState>(defaultPersistedState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState())
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  // === STATS ACTIONS ===

  const recordPomodoro = useCallback((pomodoroMinutes: number) => {
    const today = getToday()

    setState(prev => {
      const existingIndex = prev.stats.dailyStats.findIndex(d => d.date === today)
      let newDailyStats: DayStats[]

      if (existingIndex >= 0) {
        newDailyStats = prev.stats.dailyStats.map((d, i) =>
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
          ...prev.stats.dailyStats,
          {
            date: today,
            completedPomodoros: 1,
            skippedPomodoros: 0,
            focusMinutes: pomodoroMinutes,
          },
        ]
      }

      const newStreak = calculateStreak(newDailyStats)
      const newRecords = calculatePersonalRecords(newDailyStats)

      return {
        ...prev,
        stats: {
          ...prev.stats,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.stats.longestStreak, newStreak),
          totalFocusMinutes: prev.stats.totalFocusMinutes + pomodoroMinutes,
          totalPomodoros: prev.stats.totalPomodoros + 1,
          dailyStats: newDailyStats,
          lastActiveDate: today,
          personalRecords: newRecords,
        },
      }
    })
  }, [])

  const recordSkip = useCallback(() => {
    const today = getToday()

    setState(prev => {
      const existingIndex = prev.stats.dailyStats.findIndex(d => d.date === today)
      let newDailyStats: DayStats[]

      if (existingIndex >= 0) {
        newDailyStats = prev.stats.dailyStats.map((d, i) =>
          i === existingIndex ? { ...d, skippedPomodoros: d.skippedPomodoros + 1 } : d
        )
      } else {
        newDailyStats = [
          ...prev.stats.dailyStats,
          {
            date: today,
            completedPomodoros: 0,
            skippedPomodoros: 1,
            focusMinutes: 0,
          },
        ]
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          dailyStats: newDailyStats,
          lastActiveDate: today,
        },
      }
    })
  }, [])

  // === TASK ACTIONS ===

  const addTask = useCallback((task: Omit<Task, 'id' | 'completedPomodoros' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }))
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }))
  }, [])

  const incrementTaskPomodoro = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
      ),
    }))
  }, [])

  // === SETTINGS ACTIONS ===

  const updateSettings = useCallback((settings: Settings) => {
    setState(prev => ({ ...prev, settings }))
  }, [])

  // === GOALS ACTIONS ===

  const updateGoals = useCallback((goals: Goals) => {
    setState(prev => ({ ...prev, goals }))
  }, [])

  // === COMPUTED VALUES ===

  const todayStats = getTodayStats(state.stats.dailyStats)
  const focusScore = calculateFocusScore(todayStats, state.stats.currentStreak)
  const level = calculateLevel(state.stats.totalFocusMinutes)
  const goalProgress = calculateGoalProgress(state.stats.dailyStats, state.goals)
  const heatmapData = generateHeatmapData(state.stats.dailyStats)
  const totalTime = formatTotalTime(state.stats.totalFocusMinutes)

  return {
    // State
    stats: state.stats,
    tasks: state.tasks,
    settings: state.settings,
    goals: state.goals,
    isLoaded,

    // Actions
    recordPomodoro,
    recordSkip,
    addTask,
    updateTask,
    deleteTask,
    incrementTaskPomodoro,
    updateSettings,
    updateGoals,

    // Computed
    todayStats,
    focusScore,
    level,
    goalProgress,
    heatmapData,
    totalTime,
  }
}
```

**Tasks**:
- [ ] Create `hooks/use-app-state.ts`
- [ ] Implement all state actions
- [ ] Implement computed values
- [ ] Add proper TypeScript types

---

## Phase 3: Migrate Components (45 min)

### 3.1 Update page.tsx

**Changes**:
1. Replace `useStats()` with `useAppState()`
2. Remove local `tasks` state (now in useAppState)
3. Remove local `settings` state (now in useAppState)
4. Keep only true session state (timer, sessionPomodoros, activeTaskId)

**Tasks**:
- [ ] Import `useAppState` instead of `useStats`
- [ ] Remove `useState` for tasks
- [ ] Remove `useState` for settings
- [ ] Update all references to use new hook
- [ ] Update `handleAddTask` to use `addTask` from hook
- [ ] Update task operations to use hook functions

---

### 3.2 Update ReportDialog

**Changes**:
1. Receive `stats` prop instead of just `completedPomodoros`
2. Show historical data, not just session

**New Props**:
```typescript
interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: Stats
  tasks: Task[]
  todayStats: DayStats
  level: Level
}
```

**Tasks**:
- [ ] Update props interface
- [ ] Show `stats.totalPomodoros` instead of session count
- [ ] Add today's stats section
- [ ] Show personal records
- [ ] Show longest streak

---

### 3.3 Update SettingsDialog

**Changes**:
1. Add Goals section
2. Receive `goals` and `onGoalsChange` props

**Tasks**:
- [ ] Add Goals UI inputs (daily target, weekly target)
- [ ] Wire up `updateGoals` from hook
- [ ] Add proper validation

---

### 3.4 Update StatsCard

**Changes**:
1. Add `longestStreak` display
2. Add personal records display (optional, could be separate component)

**Tasks**:
- [ ] Add longestStreak prop
- [ ] Show "Best: X days" next to current streak

---

## Phase 4: Cleanup & Testing (30 min)

### 4.1 Remove Old Code

**Tasks**:
- [ ] Delete `hooks/use-stats.ts` (replaced by use-app-state)
- [ ] Remove old localStorage key migration after testing
- [ ] Clean up unused imports

---

### 4.2 Testing Checklist

**Manual Testing**:
- [ ] Fresh load (no localStorage) - defaults work
- [ ] Complete a pomodoro - stats update
- [ ] Skip a pomodoro - skip recorded
- [ ] Add task - task persists on refresh
- [ ] Complete task pomodoros - updates correctly
- [ ] Change settings - persists on refresh
- [ ] Set goals - goals show in GoalProgress
- [ ] Report dialog - shows historical data
- [ ] Heatmap - displays correctly
- [ ] StatsCard - all values correct
- [ ] Migration - old data loads correctly

---

## Phase 5: Future Enhancements (Optional)

### 5.1 Data Export/Import
- Add button to export all data as JSON
- Add ability to import data

### 5.2 Data Cleanup
- Add ability to clear all data
- Add ability to delete old dailyStats (keep last year)

### 5.3 Sync Preparation
- Storage adapter interface ready for cloud sync
- User auth integration points identified

---

## File Checklist

### New Files to Create
- [ ] `lib/types.ts`
- [ ] `lib/storage.ts`
- [ ] `lib/stats.ts`
- [ ] `hooks/use-app-state.ts`

### Files to Modify
- [ ] `app/page.tsx`
- [ ] `components/report-dialog.tsx`
- [ ] `components/settings-dialog.tsx`
- [ ] `components/stats-card.tsx`

### Files to Delete
- [ ] `hooks/use-stats.ts` (after migration complete)

---

## Rollback Plan

If issues arise:
1. Keep old `use-stats.ts` until fully tested
2. localStorage uses different key (`codefocus-app` vs `codefocus-stats`)
3. Can revert to old key if needed
4. Migration function preserves old data format knowledge
