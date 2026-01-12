"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import type { PersistedState, Stats, Settings, Goals, Task, TimerMode, DayStats, UnlockedAchievement } from "@/lib/types"
import { loadState, saveState, defaultState, getToday, saveTimerSession, loadTimerSession, clearTimerSession } from "@/lib/storage"
import type { TimerSessionState } from "@/lib/storage"
import {
  calculateLevel,
  calculateGoalProgress,
  generateHeatmapData,
  getTodayStats,
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

// Helper to save session to localStorage synchronously
// This must be called INSIDE setState updater to guarantee it runs before navigation
function syncSaveSession(session: SessionState): void {
  const hasProgress = session.timer.timeLeft !== session.timer.startDuration ||
                      session.timer.isRunning ||
                      session.sessionPomodoros > 0

  if (hasProgress) {
    saveTimerSession({
      mode: session.timer.mode,
      timeLeft: session.timer.timeLeft,
      startDuration: session.timer.startDuration,
      isRunning: session.timer.isRunning,
      savedAt: Date.now(),
      sessionPomodoros: session.sessionPomodoros,
      activeTaskId: session.activeTaskId,
    })
  }
}

export function useAppState() {
  const [persisted, setPersisted] = useState<PersistedState>(defaultState)
  const [session, setSession] = useState<SessionState>(defaultSession)
  const [isLoaded, setIsLoaded] = useState(false)

  // Track isLoaded in a ref so we can access it synchronously in state updaters
  const isLoadedRef = useRef(false)

  // Load persisted state from localStorage
  useEffect(() => {
    const loaded = loadState()
    setPersisted(loaded)

    // Try to restore timer session (for page refresh recovery)
    const savedTimer = loadTimerSession()
    if (savedTimer) {
      // Calculate how much time has passed since save
      const elapsedMs = Date.now() - savedTimer.savedAt
      const elapsedSeconds = Math.floor(elapsedMs / 1000)

      let newTimeLeft = savedTimer.timeLeft
      let shouldRun = savedTimer.isRunning

      if (savedTimer.isRunning) {
        // Adjust time for elapsed duration
        newTimeLeft = Math.max(0, savedTimer.timeLeft - elapsedSeconds)
        // If timer would have completed, set to 0 and stop
        if (newTimeLeft === 0) {
          shouldRun = false
        }
      }

      setSession({
        timer: {
          mode: savedTimer.mode,
          timeLeft: newTimeLeft,
          startDuration: savedTimer.startDuration,
          isRunning: shouldRun,
        },
        sessionPomodoros: savedTimer.sessionPomodoros,
        activeTaskId: savedTimer.activeTaskId,
      })

      // Don't clear - we'll overwrite on next save anyway
    } else {
      // No saved session, initialize with settings
      const initialDuration = loaded.settings.pomodoro * 60
      setSession((prev) => ({
        ...prev,
        timer: {
          ...prev.timer,
          timeLeft: initialDuration,
          startDuration: initialDuration,
        },
      }))
    }

    isLoadedRef.current = true
    setIsLoaded(true)
  }, [])

  // Save persisted state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveState(persisted)
    }
  }, [persisted, isLoaded])

  // NOTE: Timer session is saved SYNCHRONOUSLY inside each state updater function
  // This guarantees the save happens before any navigation can unmount the component
  // See syncSaveSession() helper and its usage in setTimerRunning, setTimeLeft, etc.

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
    setSession((prev) => {
      const newSession = {
        ...prev,
        sessionPomodoros: prev.sessionPomodoros + 1,
      }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
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
    setSession((prev) => {
      if (prev.activeTaskId !== id) return prev
      const newSession = { ...prev, activeTaskId: null }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
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

  // === ACHIEVEMENTS ACTIONS ===

  const unlockAchievement = useCallback((achievementId: string) => {
    setPersisted((prev) => {
      // Don't add if already unlocked
      if (prev.achievements.some((a) => a.id === achievementId)) {
        return prev
      }
      return {
        ...prev,
        achievements: [
          ...prev.achievements,
          { id: achievementId, unlockedAt: new Date().toISOString() },
        ],
      }
    })
  }, [])

  const markAchievementsSeen = useCallback((achievementIds: string[]) => {
    setPersisted((prev) => ({
      ...prev,
      achievements: prev.achievements.map((a) =>
        achievementIds.includes(a.id) && !a.seenAt
          ? { ...a, seenAt: new Date().toISOString() }
          : a
      ),
    }))
  }, [])

  // === SESSION ACTIONS ===

  const setActiveTask = useCallback((taskId: string | null) => {
    setSession((prev) => {
      const newSession = { ...prev, activeTaskId: taskId }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
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
      const newSession = {
        ...prev,
        timer: {
          ...prev.timer,
          mode,
          timeLeft: duration,
          startDuration: duration,
          isRunning: false
        },
      }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
  }, [persisted.settings])

  const setTimerRunning = useCallback((isRunning: boolean) => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        timer: { ...prev.timer, isRunning },
      }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
  }, [])

  const setTimeLeft = useCallback((timeLeftOrUpdater: number | ((prev: number) => number)) => {
    setSession((prev) => {
      const newTimeLeft = typeof timeLeftOrUpdater === 'function'
        ? timeLeftOrUpdater(prev.timer.timeLeft)
        : timeLeftOrUpdater
      const newSession = {
        ...prev,
        timer: { ...prev.timer, timeLeft: newTimeLeft },
      }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
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
      const newSession = {
        ...prev,
        timer: {
          ...prev.timer,
          timeLeft: duration,
          startDuration: duration,
          isRunning: false
        },
      }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
  }, [persisted.settings])

  const resetSessionPomodoros = useCallback(() => {
    setSession((prev) => {
      const newSession = { ...prev, sessionPomodoros: 0 }
      if (isLoadedRef.current) syncSaveSession(newSession)
      return newSession
    })
  }, [])

  // === COMPUTED VALUES ===

  const todayStats = useMemo(
    () => getTodayStats(persisted.stats.dailyStats),
    [persisted.stats.dailyStats]
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

  const activeTask = useMemo(
    () => persisted.tasks.find((t) => t.id === session.activeTaskId) || null,
    [persisted.tasks, session.activeTaskId]
  )

  // Computed: unlocked achievement IDs for quick lookup
  const unlockedAchievementIds = useMemo(
    () => persisted.achievements.map((a) => a.id),
    [persisted.achievements]
  )

  return {
    // State
    stats: persisted.stats,
    tasks: persisted.tasks,
    settings: persisted.settings,
    goals: persisted.goals,
    achievements: persisted.achievements,
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

    // Achievements actions
    unlockAchievement,
    markAchievementsSeen,

    // Timer actions
    setTimerMode,
    setTimerRunning,
    setTimeLeft,
    resetTimer,
    resetSessionPomodoros,

    // Computed values
    todayStats,
    level,
    goalProgress,
    heatmapData,
    activeTask,
    unlockedAchievementIds,
  }
}
