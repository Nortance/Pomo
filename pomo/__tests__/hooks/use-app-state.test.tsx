import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAppState } from '@/hooks/use-app-state'
import { defaultState } from '@/lib/storage'

// Mock crypto.randomUUID for consistent task IDs
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
})

describe('useAppState', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should return default state on first load', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.stats).toEqual(defaultState.stats)
      expect(result.current.tasks).toEqual([])
      expect(result.current.settings).toEqual(defaultState.settings)
      expect(result.current.goals).toEqual(defaultState.goals)
      expect(result.current.achievements).toEqual([])
    })

    it('should have default timer state', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.timer.mode).toBe('pomodoro')
      expect(result.current.timer.isRunning).toBe(false)
      expect(result.current.timer.timeLeft).toBe(25 * 60)
      expect(result.current.timer.startDuration).toBe(25 * 60)
    })

    it('should have default session state', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.sessionPomodoros).toBe(0)
      expect(result.current.activeTaskId).toBeNull()
    })

    it('should set isLoaded to true after mount', () => {
      const { result } = renderHook(() => useAppState())

      expect(result.current.isLoaded).toBe(true)
    })
  })

  describe('task actions', () => {
    describe('addTask', () => {
      it('should add a new task', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Test Task',
            estimatedPomodoros: 4,
          })
        })

        expect(result.current.tasks).toHaveLength(1)
        expect(result.current.tasks[0].title).toBe('Test Task')
        expect(result.current.tasks[0].estimatedPomodoros).toBe(4)
      })

      it('should set default values for new task', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Test Task',
            estimatedPomodoros: 2,
          })
        })

        const task = result.current.tasks[0]
        expect(task.id).toBe('test-uuid-1234')
        expect(task.completedPomodoros).toBe(0)
        expect(task.completed).toBe(false)
        expect(task.createdAt).toBeDefined()
      })

      it('should return the new task ID', () => {
        const { result } = renderHook(() => useAppState())

        let taskId: string
        act(() => {
          taskId = result.current.addTask({
            title: 'Test Task',
            estimatedPomodoros: 2,
          })
        })

        expect(taskId!).toBe('test-uuid-1234')
      })
    })

    describe('updateTask', () => {
      it('should update task properties', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Original Title',
            estimatedPomodoros: 2,
          })
        })

        act(() => {
          result.current.updateTask('test-uuid-1234', { title: 'Updated Title' })
        })

        expect(result.current.tasks[0].title).toBe('Updated Title')
      })

      it('should preserve other properties when updating', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Task',
            estimatedPomodoros: 4,
          })
        })

        act(() => {
          result.current.updateTask('test-uuid-1234', { completed: true })
        })

        expect(result.current.tasks[0].title).toBe('Task')
        expect(result.current.tasks[0].estimatedPomodoros).toBe(4)
        expect(result.current.tasks[0].completed).toBe(true)
      })
    })

    describe('deleteTask', () => {
      it('should remove a task', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Task to delete',
            estimatedPomodoros: 1,
          })
        })

        expect(result.current.tasks).toHaveLength(1)

        act(() => {
          result.current.deleteTask('test-uuid-1234')
        })

        expect(result.current.tasks).toHaveLength(0)
      })

      it('should clear activeTaskId if deleted task was active', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Task',
            estimatedPomodoros: 1,
          })
        })

        act(() => {
          result.current.setActiveTask('test-uuid-1234')
        })

        expect(result.current.activeTaskId).toBe('test-uuid-1234')

        act(() => {
          result.current.deleteTask('test-uuid-1234')
        })

        expect(result.current.activeTaskId).toBeNull()
      })
    })

    describe('completeTaskPomodoro', () => {
      it('should increment completedPomodoros', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Task',
            estimatedPomodoros: 4,
          })
        })

        expect(result.current.tasks[0].completedPomodoros).toBe(0)

        act(() => {
          result.current.completeTaskPomodoro('test-uuid-1234')
        })

        expect(result.current.tasks[0].completedPomodoros).toBe(1)

        act(() => {
          result.current.completeTaskPomodoro('test-uuid-1234')
        })

        expect(result.current.tasks[0].completedPomodoros).toBe(2)
      })
    })

    describe('toggleTaskComplete', () => {
      it('should toggle completed status', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Task',
            estimatedPomodoros: 1,
          })
        })

        expect(result.current.tasks[0].completed).toBe(false)

        act(() => {
          result.current.toggleTaskComplete('test-uuid-1234')
        })

        expect(result.current.tasks[0].completed).toBe(true)

        act(() => {
          result.current.toggleTaskComplete('test-uuid-1234')
        })

        expect(result.current.tasks[0].completed).toBe(false)
      })
    })

    describe('setActiveTask', () => {
      it('should set active task', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setActiveTask('some-task-id')
        })

        expect(result.current.activeTaskId).toBe('some-task-id')
      })

      it('should clear active task when set to null', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setActiveTask('some-task-id')
        })

        act(() => {
          result.current.setActiveTask(null)
        })

        expect(result.current.activeTaskId).toBeNull()
      })
    })
  })

  describe('settings actions', () => {
    describe('updateSettings', () => {
      it('should update settings', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.updateSettings({ pomodoro: 30 })
        })

        expect(result.current.settings.pomodoro).toBe(30)
      })

      it('should preserve other settings', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.updateSettings({ soundEnabled: false })
        })

        expect(result.current.settings.pomodoro).toBe(25)
        expect(result.current.settings.shortBreak).toBe(5)
        expect(result.current.settings.soundEnabled).toBe(false)
      })

      it('should update multiple settings at once', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.updateSettings({
            pomodoro: 30,
            shortBreak: 10,
            longBreak: 20,
          })
        })

        expect(result.current.settings.pomodoro).toBe(30)
        expect(result.current.settings.shortBreak).toBe(10)
        expect(result.current.settings.longBreak).toBe(20)
      })
    })
  })

  describe('goals actions', () => {
    describe('setGoals', () => {
      it('should set daily goal', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setGoals({ dailyPomodoros: 8 })
        })

        expect(result.current.goals.dailyPomodoros).toBe(8)
      })

      it('should set weekly goal', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setGoals({ weeklyPomodoros: 25 })
        })

        expect(result.current.goals.weeklyPomodoros).toBe(25)
      })

      it('should set both goals at once', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setGoals({ dailyPomodoros: 8, weeklyPomodoros: 25 })
        })

        expect(result.current.goals.dailyPomodoros).toBe(8)
        expect(result.current.goals.weeklyPomodoros).toBe(25)
      })
    })
  })

  describe('achievements actions', () => {
    describe('unlockAchievement', () => {
      it('should add achievement to unlocked list', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        expect(result.current.achievements).toHaveLength(1)
        expect(result.current.achievements[0].id).toBe('first-focus')
        expect(result.current.achievements[0].unlockedAt).toBeDefined()
      })

      it('should not add duplicate achievements', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        expect(result.current.achievements).toHaveLength(1)
      })

      it('should add multiple different achievements', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        act(() => {
          result.current.unlockAchievement('getting-started')
        })

        expect(result.current.achievements).toHaveLength(2)
      })
    })

    describe('markAchievementsSeen', () => {
      it('should mark achievements as seen', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        expect(result.current.achievements[0].seenAt).toBeUndefined()

        act(() => {
          result.current.markAchievementsSeen(['first-focus'])
        })

        expect(result.current.achievements[0].seenAt).toBeDefined()
      })

      it('should not update already seen achievements', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        act(() => {
          result.current.markAchievementsSeen(['first-focus'])
        })

        const firstSeenAt = result.current.achievements[0].seenAt

        act(() => {
          result.current.markAchievementsSeen(['first-focus'])
        })

        expect(result.current.achievements[0].seenAt).toBe(firstSeenAt)
      })
    })
  })

  describe('timer actions', () => {
    describe('setTimerMode', () => {
      it('should change to pomodoro mode', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerMode('shortBreak')
        })

        act(() => {
          result.current.setTimerMode('pomodoro')
        })

        expect(result.current.timer.mode).toBe('pomodoro')
        expect(result.current.timer.timeLeft).toBe(25 * 60)
      })

      it('should change to short break mode', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerMode('shortBreak')
        })

        expect(result.current.timer.mode).toBe('shortBreak')
        expect(result.current.timer.timeLeft).toBe(5 * 60)
      })

      it('should change to long break mode', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerMode('longBreak')
        })

        expect(result.current.timer.mode).toBe('longBreak')
        expect(result.current.timer.timeLeft).toBe(15 * 60)
      })

      it('should stop the timer when changing mode', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerRunning(true)
        })

        act(() => {
          result.current.setTimerMode('shortBreak')
        })

        expect(result.current.timer.isRunning).toBe(false)
      })
    })

    describe('setTimerRunning', () => {
      it('should start the timer', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerRunning(true)
        })

        expect(result.current.timer.isRunning).toBe(true)
      })

      it('should stop the timer', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerRunning(true)
        })

        act(() => {
          result.current.setTimerRunning(false)
        })

        expect(result.current.timer.isRunning).toBe(false)
      })
    })

    describe('setTimeLeft', () => {
      it('should set time left directly', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimeLeft(100)
        })

        expect(result.current.timer.timeLeft).toBe(100)
      })

      it('should accept an updater function', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimeLeft((prev) => prev - 1)
        })

        expect(result.current.timer.timeLeft).toBe(25 * 60 - 1)
      })
    })

    describe('resetTimer', () => {
      it('should reset timer to full duration', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimeLeft(100)
        })

        act(() => {
          result.current.resetTimer()
        })

        expect(result.current.timer.timeLeft).toBe(25 * 60)
        expect(result.current.timer.startDuration).toBe(25 * 60)
      })

      it('should stop the timer', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerRunning(true)
        })

        act(() => {
          result.current.resetTimer()
        })

        expect(result.current.timer.isRunning).toBe(false)
      })

      it('should respect current mode', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setTimerMode('shortBreak')
        })

        act(() => {
          result.current.setTimeLeft(60)
        })

        act(() => {
          result.current.resetTimer()
        })

        expect(result.current.timer.timeLeft).toBe(5 * 60)
      })
    })

    describe('resetSessionPomodoros', () => {
      it('should reset session pomodoros to 0', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordPomodoro(25)
        })

        expect(result.current.sessionPomodoros).toBe(1)

        act(() => {
          result.current.resetSessionPomodoros()
        })

        expect(result.current.sessionPomodoros).toBe(0)
      })
    })
  })

  describe('stats actions', () => {
    describe('recordPomodoro', () => {
      it('should increment totalPomodoros', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordPomodoro(25)
        })

        expect(result.current.stats.totalPomodoros).toBe(1)
      })

      it('should add focus minutes', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordPomodoro(25)
        })

        expect(result.current.stats.totalFocusMinutes).toBe(25)
      })

      it('should increment session pomodoros', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordPomodoro(25)
        })

        expect(result.current.sessionPomodoros).toBe(1)

        act(() => {
          result.current.recordPomodoro(25)
        })

        expect(result.current.sessionPomodoros).toBe(2)
      })

      it('should use provided focus minutes', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordPomodoro(30)
        })

        expect(result.current.stats.totalFocusMinutes).toBe(30)
      })
    })

    describe('recordSkip', () => {
      it('should increment skipped pomodoros in daily stats', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordSkip()
        })

        expect(result.current.todayStats.skippedPomodoros).toBe(1)
      })

      it('should not affect total pomodoros', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.recordSkip()
        })

        expect(result.current.stats.totalPomodoros).toBe(0)
      })
    })
  })

  describe('computed values', () => {
    describe('todayStats', () => {
      it('should return today stats', () => {
        const { result } = renderHook(() => useAppState())

        expect(result.current.todayStats.completedPomodoros).toBe(0)

        act(() => {
          result.current.recordPomodoro(25)
        })

        expect(result.current.todayStats.completedPomodoros).toBe(1)
      })
    })

    describe('level', () => {
      it('should calculate level from total focus minutes', () => {
        const { result } = renderHook(() => useAppState())

        expect(result.current.level.name).toBe('Apprentice')
        expect(result.current.level.tier).toBe(1)
      })
    })

    describe('goalProgress', () => {
      it('should calculate goal progress', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.setGoals({ dailyPomodoros: 4 })
        })

        expect(result.current.goalProgress.daily.target).toBe(4)
        expect(result.current.goalProgress.daily.current).toBe(0)
      })
    })

    describe('activeTask', () => {
      it('should return null when no active task', () => {
        const { result } = renderHook(() => useAppState())

        expect(result.current.activeTask).toBeNull()
      })

      it('should return the active task object', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.addTask({
            title: 'Active Task',
            estimatedPomodoros: 2,
          })
        })

        act(() => {
          result.current.setActiveTask('test-uuid-1234')
        })

        expect(result.current.activeTask).not.toBeNull()
        expect(result.current.activeTask?.title).toBe('Active Task')
      })
    })

    describe('unlockedAchievementIds', () => {
      it('should return empty array initially', () => {
        const { result } = renderHook(() => useAppState())

        expect(result.current.unlockedAchievementIds).toEqual([])
      })

      it('should return unlocked achievement IDs', () => {
        const { result } = renderHook(() => useAppState())

        act(() => {
          result.current.unlockAchievement('first-focus')
        })

        act(() => {
          result.current.unlockAchievement('level-apprentice')
        })

        expect(result.current.unlockedAchievementIds).toContain('first-focus')
        expect(result.current.unlockedAchievementIds).toContain('level-apprentice')
      })
    })
  })

  describe('persistence', () => {
    it('should persist state to localStorage', () => {
      const { result } = renderHook(() => useAppState())

      act(() => {
        result.current.addTask({
          title: 'Persisted Task',
          estimatedPomodoros: 2,
        })
      })

      const stored = localStorage.getItem('codefocus-app')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.tasks).toHaveLength(1)
      expect(parsed.tasks[0].title).toBe('Persisted Task')
    })

    it('should load persisted state on mount', () => {
      // Pre-populate localStorage
      const savedState = {
        ...defaultState,
        stats: { ...defaultState.stats, totalPomodoros: 42 },
      }
      localStorage.setItem('codefocus-app', JSON.stringify(savedState))

      const { result } = renderHook(() => useAppState())

      expect(result.current.stats.totalPomodoros).toBe(42)
    })
  })
})
