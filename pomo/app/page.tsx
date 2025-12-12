"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Settings, BarChart3, User, Keyboard, Sparkles, SkipForward, Timer } from "lucide-react"
import { TaskList } from "@/components/task-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { ReportDialog } from "@/components/report-dialog"
import { ShortcutsDialog } from "@/components/shortcuts-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

type TimerMode = "pomodoro" | "shortBreak" | "longBreak"

interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  note?: string
  completed: boolean
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)

  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4,
  })

  const durations = {
    pomodoro: settings.pomodoro * 60,
    shortBreak: settings.shortBreak * 60,
    longBreak: settings.longBreak * 60,
  }

  const progress = 1 - timeLeft / durations[mode]
  const circumference = 2 * Math.PI * 140 // radius = 140
  const strokeDashoffset = circumference * (1 - progress)

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode)
      setTimeLeft(durations[newMode])
      setIsRunning(false)
    },
    [settings],
  )

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (mode === "pomodoro") {
        setCompletedPomodoros((prev) => prev + 1)
        if (activeTaskId) {
          setTasks((prev) =>
            prev.map((task) =>
              task.id === activeTaskId ? { ...task, completedPomodoros: task.completedPomodoros + 1 } : task,
            ),
          )
        }
        const nextMode = (completedPomodoros + 1) % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak"
        switchMode(nextMode)
        if (settings.autoStartBreaks) setIsRunning(true)
      } else {
        switchMode("pomodoro")
        if (settings.autoStartPomodoros) setIsRunning(true)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode, completedPomodoros, activeTaskId, settings, switchMode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          setIsRunning((prev) => !prev)
          break
        case "1":
          switchMode("pomodoro")
          break
        case "2":
          switchMode("shortBreak")
          break
        case "3":
          switchMode("longBreak")
          break
        case "t":
        case "T":
          setAddTaskOpen(true)
          break
        case "r":
        case "R":
          setReportOpen((prev) => !prev)
          break
        case "s":
        case "S":
          setSettingsOpen((prev) => !prev)
          break
        case "?":
          setShortcutsOpen((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [switchMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAddTask = (task: Omit<Task, "id" | "completedPomodoros" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completedPomodoros: 0,
      completed: false,
    }
    setTasks((prev) => [...prev, newTask])
  }

  const handleSkip = () => {
    if (mode === "pomodoro") {
      const nextMode = (completedPomodoros + 1) % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak"
      switchMode(nextMode)
    } else {
      switchMode("pomodoro")
    }
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/codefocus_logo_medium_no_bg.webp"
              alt="CodeFocus"
              className="h-10 w-auto dark:invert"
            />
            <span className="font-[family-name:var(--font-montserrat)] font-semibold tracking-tight text-lg">
              codefocus<span className="text-muted-foreground">.io</span>
            </span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReportOpen(true)}
              className="text-xs gap-1.5 h-8 px-2.5 sm:px-3"
              aria-label="Report"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
              <kbd className="hidden lg:inline-flex ml-1 h-5 items-center px-1.5 bg-muted text-muted-foreground text-[10px]">
                R
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="text-xs gap-1.5 h-8 px-2.5 sm:px-3"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
              <kbd className="hidden lg:inline-flex ml-1 h-5 items-center px-1.5 bg-muted text-muted-foreground text-[10px]">
                S
              </kbd>
            </Button>
            <Link href="/signin" aria-label="Sign In">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 px-2.5 sm:px-3">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShortcutsOpen(true)} aria-label="Keyboard shortcuts">
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <div className="border border-border bg-card p-4 sm:p-8 mb-6 sm:mb-8 shadow-sm">
          {/* Mode Tabs - improved visual distinction */}
          <div className="flex justify-center gap-1 mb-6 sm:mb-10">
            {(["pomodoro", "shortBreak", "longBreak"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-3 sm:px-4 py-2 text-xs font-medium tracking-wide transition-all duration-200 ${
                  mode === m
                    ? "bg-foreground text-background border border-foreground"
                    : "text-muted-foreground border border-dashed border-border hover:text-foreground hover:border-foreground"
                }`}
              >
                {m === "pomodoro" ? "Focus" : m === "shortBreak" ? "Break" : "Rest"}
              </button>
            ))}
          </div>

          {/* Timer Display with Progress Ring */}
          <div className="flex flex-col items-center mb-6 sm:mb-10">
            <div className="relative">
              {/* SVG Progress Ring */}
              <svg className="w-56 h-56 sm:w-72 sm:h-72 -rotate-90" viewBox="0 0 300 300">
                {/* Background circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                />
                {/* Progress circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-foreground transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Time display centered in ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl sm:text-7xl font-light tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-2 text-center">
                  {activeTask ? (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[160px] sm:max-w-[200px]">
                      {activeTask.title}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {mode === "pomodoro" ? "Time to focus" : mode === "shortBreak" ? "Take a break" : "Time to rest"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Button
              size="lg"
              className={`h-11 px-8 sm:px-12 text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center ${
                isRunning
                  ? "bg-muted text-foreground hover:bg-muted/80"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? "Pause" : "Start"}
              <kbd className="ml-2 mt-0.5 text-[10px] opacity-60 hidden sm:inline">space</kbd>
            </Button>
            {isRunning && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleSkip}
                className="h-11 w-11 transition-all duration-200 hover:bg-muted bg-transparent"
                aria-label="Skip to next session"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Session Stats */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Session</span>
            <div className="flex gap-1">
              {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 transition-colors ${
                    i < (completedPomodoros % settings.longBreakInterval) ? "bg-foreground" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Total</span>
            <span className="text-xs sm:text-sm tabular-nums font-medium">{completedPomodoros}</span>
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectTask={setActiveTaskId}
          onAddTask={() => setAddTaskOpen(true)}
          onUpdateTask={(id, updates) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))}
          onDeleteTask={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        />

        {/* Premium Banner */}
        <Link href="/premium" className="block mt-6 sm:mt-8">
          <div className="border border-border p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Unlock premium features</span>
            </div>
            <span className="text-xs text-muted-foreground group-hover:translate-x-0.5 transition-transform">
              Learn more →
            </span>
          </div>
        </Link>
      </main>

      {/* Dialogs */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
      />
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        completedPomodoros={completedPomodoros}
        tasks={tasks}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} onAddTask={handleAddTask} />
    </div>
  )
}
