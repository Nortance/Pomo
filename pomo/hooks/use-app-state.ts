"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { PersistedState, Stats, Settings, Goals, Task, TimerMode, DayStats } from "@/lib/types"
import { loadState, saveState, defaultState, getToday } from "@/lib/storage"
import {
  calculateStreak,
  calculateFocusScore,
  calculateLevel,
  calculateGoalProgress,
  generateHeatmapData,
  getTodayStats,
  formatTotalTime,
  addCompletedPomodoro,
  addSkippedPomodoro,
} from "@/lib/stats"

// Session-only state (not persisted)
interface SessionState {
  timer: {
    mode: TimerMode
    isRunning: boolean
    timeLeft: number
    startDuration: number // Duration when timer started (for accurate progress/recording)
  }
  sessionPomodoros: number
  activeTaskId: string | null
}

const defaultSession: SessionState = {
  timer: {
    mode: "pomodoro",
    isRunning: false,
    timeLeft: 25 * 60,
    startDuration: 25 * 60,
  },
  sessionPomodoros: 0,
  activeTaskId: null,
}

export function useAppState() {
  const [persisted, setPersisted] = useState<PersistedState>(defaultState)
  const [session, setSession] = useState<SessionState>(defaultSession)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load persisted state from localStorage
  useEffect(() => {
    const loaded = loadState()
    setPersisted(loaded)
    // Initialize timer with loaded settings
    const initialDuration = loaded.settings.pomodoro * 60
    setSession((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        timeLeft: initialDuration,
        startDuration: initialDuration,
      },
    }))
    setIsLoaded(true)
  }, [])

  // Save persisted state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveState(persisted)
    }
  }, [persisted, isLoaded])

  // Sync timer with settings when settings change (only if timer is at full duration / not started)
  useEffect(() => {
    if (!isLoaded) return

    setSession((prev) => {
      // Only update if timer is at full duration (hasn't started counting down)
      if (prev.timer.timeLeft !== prev.timer.startDuration) {
        return prev // Timer is in progress, don't update
      }

      // Get the new duration for current mode
      let newDuration: number
      switch (prev.timer.mode) {
        case "pomodoro":
          newDuration = persisted.settings.pomodoro * 60
          break
        case "shortBreak":
          newDuration = persisted.settings.shortBreak * 60
          break
        case "longBreak":
          newDuration = persisted.settings.longBreak * 60
          break
      }

      // Only update if duration actually changed
      if (newDuration === prev.timer.startDuration) {
        return prev
      }

      return {
        ...prev,
        timer: {
          ...prev.timer,
          timeLeft: newDuration,
          startDuration: newDuration,
        },
      }
    })
  }, [persisted.settings, isLoaded])

  // === STATS ACTIONS ===

  const recordPomodoro = useCallback((focusMinutes?: number) => {
    setPersisted((prev) => ({
      ...prev,
      // Use provided focusMinutes (from startDuration) or fall back to current settings
      stats: addCompletedPomodoro(prev.stats, focusMinutes ?? prev.settings.pomodoro),
    }))
    setSession((prev) => ({
      ...prev,
      sessionPomodoros: prev.sessionPomodoros + 1,
    }))
  }, [])

  const recordSkip = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      stats: addSkippedPomodoro(prev.stats),
    }))
  }, [])

  // === TASK ACTIONS ===

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "completedPomodoros" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completedPomodoros: 0,
      completed: false,
    }
    setPersisted((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }))
    return newTask.id
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }))
    // Clear active task if it was deleted
    setSession((prev) =>
      prev.activeTaskId === id ? { ...prev, activeTaskId: null } : prev
    )
  }, [])

  const completeTaskPomodoro = useCallback((taskId: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
          : t
      ),
    }))
  }, [])

  const toggleTaskComplete = useCallback((id: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }))
  }, [])

  // === SETTINGS ACTIONS ===

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setPersisted((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }))
  }, [])

  // === GOALS ACTIONS ===

  const setGoals = useCallback((goals: Partial<Goals>) => {
    setPersisted((prev) => ({
      ...prev,
      goals: { ...prev.goals, ...goals },
    }))
  }, [])

  // === SESSION ACTIONS ===

  const setActiveTask = useCallback((taskId: string | null) => {
    setSession((prev) => ({ ...prev, activeTaskId: taskId }))
  }, [])

  const setTimerMode = useCallback((mode: TimerMode) => {
    setSession((prev) => {
      let duration: number
      switch (mode) {
        case "pomodoro":
          duration = persisted.settings.pomodoro * 60
          break
        case "shortBreak":
          duration = persisted.settings.shortBreak * 60
          break
        case "longBreak":
          duration = persisted.settings.longBreak * 60
          break
      }
      return {
        ...prev,
        timer: {
          ...prev.timer,
          mode,
          timeLeft: duration,
          startDuration: duration,
          isRunning: false
        },
      }
    })
  }, [persisted.settings])

  const setTimerRunning = useCallback((isRunning: boolean) => {
    setSession((prev) => ({
      ...prev,
      timer: { ...prev.timer, isRunning },
    }))
  }, [])

  const setTimeLeft = useCallback((timeLeftOrUpdater: number | ((prev: number) => number)) => {
    setSession((prev) => {
      const newTimeLeft = typeof timeLeftOrUpdater === 'function'
        ? timeLeftOrUpdater(prev.timer.timeLeft)
        : timeLeftOrUpdater
      return {
        ...prev,
        timer: { ...prev.timer, timeLeft: newTimeLeft },
      }
    })
  }, [])

  const resetTimer = useCallback(() => {
    setSession((prev) => {
      let duration: number
      switch (prev.timer.mode) {
        case "pomodoro":
          duration = persisted.settings.pomodoro * 60
          break
        case "shortBreak":
          duration = persisted.settings.shortBreak * 60
          break
        case "longBreak":
          duration = persisted.settings.longBreak * 60
          break
      }
      return {
        ...prev,
        timer: {
          ...prev.timer,
          timeLeft: duration,
          startDuration: duration,
          isRunning: false
        },
      }
    })
  }, [persisted.settings])

  const resetSessionPomodoros = useCallback(() => {
    setSession((prev) => ({ ...prev, sessionPomodoros: 0 }))
  }, [])

  // === COMPUTED VALUES ===

  const todayStats = useMemo(
    () => getTodayStats(persisted.stats.dailyStats),
    [persisted.stats.dailyStats]
  )

  const focusScore = useMemo(
    () => calculateFocusScore(todayStats, persisted.stats.currentStreak),
    [todayStats, persisted.stats.currentStreak]
  )

  const level = useMemo(
    () => calculateLevel(persisted.stats.totalFocusMinutes),
    [persisted.stats.totalFocusMinutes]
  )

  const goalProgress = useMemo(
    () => calculateGoalProgress(persisted.stats.dailyStats, persisted.goals, getToday()),
    [persisted.stats.dailyStats, persisted.goals]
  )

  const heatmapData = useMemo(
    () => generateHeatmapData(persisted.stats.dailyStats),
    [persisted.stats.dailyStats]
  )

  const totalTime = useMemo(
    () => formatTotalTime(persisted.stats.totalFocusMinutes),
    [persisted.stats.totalFocusMinutes]
  )

  const activeTask = useMemo(
    () => persisted.tasks.find((t) => t.id === session.activeTaskId) || null,
    [persisted.tasks, session.activeTaskId]
  )

  return {
    // State
    stats: persisted.stats,
    tasks: persisted.tasks,
    settings: persisted.settings,
    goals: persisted.goals,
    timer: session.timer,
    sessionPomodoros: session.sessionPomodoros,
    activeTaskId: session.activeTaskId,
    isLoaded,

    // Stats actions
    recordPomodoro,
    recordSkip,

    // Task actions
    addTask,
    updateTask,
    deleteTask,
    completeTaskPomodoro,
    toggleTaskComplete,
    setActiveTask,

    // Settings actions
    updateSettings,

    // Goals actions
    setGoals,

    // Timer actions
    setTimerMode,
    setTimerRunning,
    setTimeLeft,
    resetTimer,
    resetSessionPomodoros,

    // Computed values
    todayStats,
    focusScore,
    level,
    goalProgress,
    heatmapData,
    totalTime,
    activeTask,
  }
}
