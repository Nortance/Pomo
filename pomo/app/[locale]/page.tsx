"use client"

import { useEffect, useCallback, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, BarChart3, User, Keyboard, Sparkles, SkipForward, Award, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskList } from "@/components/task-list"
import { ThemeToggle } from "@/components/theme-toggle"
import { AmbientSounds } from "@/components/ambient-sounds"
import { StatsCard } from "@/components/stats-card"
import { StreakHeatmap } from "@/components/streak-heatmap"
import { GoalProgress } from "@/components/goal-progress"
import { LanguageSwitcher } from "@/components/language-switcher"
import { checkNewAchievements } from "@/lib/achievements"
import { track } from "@/lib/analytics"
import { MixpanelEvents } from "@/lib/mixpanel-events"
import { useAppState } from "@/hooks/use-app-state"
import { useCelebration } from "@/hooks/use-celebration"
import { useSound } from "@/hooks/use-sound"
import { useOnboarding } from "@/hooks/use-onboarding"
import { useTranslations } from "@/hooks/use-translations"
import type { TimerMode } from "@/lib/types"

// Lazy load dialogs - only loaded when user opens them
const SettingsDialog = dynamic(
  () => import("@/components/settings-dialog").then((mod) => mod.SettingsDialog),
  { ssr: false }
)
const ReportDialog = dynamic(
  () => import("@/components/report-dialog").then((mod) => mod.ReportDialog),
  { ssr: false }
)
const ShortcutsDialog = dynamic(
  () => import("@/components/shortcuts-dialog").then((mod) => mod.ShortcutsDialog),
  { ssr: false }
)
const AddTaskDialog = dynamic(
  () => import("@/components/add-task-dialog").then((mod) => mod.AddTaskDialog),
  { ssr: false }
)
const AchievementsDialog = dynamic(
  () => import("@/components/achievements-dialog").then((mod) => mod.AchievementsDialog),
  { ssr: false }
)
const LevelUpModal = dynamic(
  () => import("@/components/level-up-modal").then((mod) => mod.LevelUpModal),
  { ssr: false }
)

export default function PomodoroTimer() {
  // Dialog state (UI only, doesn't need persistence)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const [levelUpOpen, setLevelUpOpen] = useState(false)

  // Unified app state
  const {
    // State
    stats,
    tasks,
    settings,
    goals,
    timer,
    sessionPomodoros,
    activeTaskId,
    isLoaded,

    // Stats actions
    recordPomodoro,
    recordSkip,

    // Task actions
    addTask,
    updateTask,
    deleteTask,
    completeTaskPomodoro,
    setActiveTask,

    // Settings actions
    updateSettings,

    // Goals actions
    setGoals,

    // Achievements actions
    unlockAchievement,
    markAchievementsSeen,
    unlockedAchievementIds,
    achievements,

    // Timer actions
    setTimerMode,
    setTimerRunning,
    setTimeLeft,
    resetSessionPomodoros,

    // Computed values
    todayStats,
    level,
    goalProgress,
    heatmapData,
    activeTask,
  } = useAppState()

  // Celebration hook for pomodoro completion
  const { celebratePomodoroComplete, celebrateDailyGoal, celebrateAchievement, celebrateLevelUp } = useCelebration({
    soundEnabled: settings.soundEnabled,
  })

  // Sound hook for UI interactions
  const { playClick } = useSound(settings.soundEnabled)

  // Onboarding tour for first-time users
  const { startSettingsTour } = useOnboarding()

  // Translations
  const { t } = useTranslations()

  // Track previous stats to detect new achievements and level-ups
  const [prevTotalPomodoros, setPrevTotalPomodoros] = useState(0)
  const [prevLevelTier, setPrevLevelTier] = useState(0)

  // Check for new achievements when stats change (after pomodoro completion)
  useEffect(() => {
    if (!isLoaded) return
    // Only check when total pomodoros increases
    if (stats.totalPomodoros <= prevTotalPomodoros) {
      setPrevTotalPomodoros(stats.totalPomodoros)
      return
    }
    setPrevTotalPomodoros(stats.totalPomodoros)

    // Check for new achievements
    const context = {
      justCompletedPomodoro: true,
      currentHour: new Date().getHours(),
      sessionPomodoros: sessionPomodoros,
    }
    const newAchievements = checkNewAchievements(stats, unlockedAchievementIds, context)

    // Unlock and celebrate each new achievement
    let delay = 2000 // Start after the pomodoro celebration
    newAchievements.forEach((achievement) => {
      setTimeout(() => {
        unlockAchievement(achievement.id)
        celebrateAchievement(achievement.name, achievement.description)
      }, delay)
      delay += 2000 // Stagger multiple achievements
    })
  }, [stats.totalPomodoros, isLoaded, stats, unlockedAchievementIds, sessionPomodoros, unlockAchievement, celebrateAchievement, prevTotalPomodoros])

  // Check for level-ups
  useEffect(() => {
    if (!isLoaded) return
    // Initialize on first load
    if (prevLevelTier === 0) {
      setPrevLevelTier(level.tier)
      return
    }
    // Check if level tier increased
    if (level.tier > prevLevelTier) {
      setPrevLevelTier(level.tier)
      // Show level-up modal and celebration after a short delay
      setTimeout(() => {
        celebrateLevelUp(level.name, level.tier)
        setLevelUpOpen(true)
      }, 3000) // After pomodoro celebration and potential achievements
    }
  }, [level.tier, isLoaded, level.name, prevLevelTier, celebrateLevelUp])

  // Use startDuration for accurate progress (not affected by settings changes mid-timer)
  const progress = timer.startDuration > 0 ? 1 - timer.timeLeft / timer.startDuration : 0
  const circumference = 2 * Math.PI * 140

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setTimerMode(newMode)
    },
    [setTimerMode],
  )

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timer.isRunning && timer.timeLeft > 0) {
      interval = setInterval(() => {
        // Use functional update to avoid stale closure
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timer.timeLeft === 0) {
      if (timer.mode === "pomodoro") {
        // Pass actual focused duration (startDuration in minutes) for accurate tracking
        const xpEarned = Math.round(timer.startDuration / 60)
        recordPomodoro(xpEarned)
        track(MixpanelEvents.POMODORO_COMPLETED, {
          duration_minutes: xpEarned,
          had_active_task: !!activeTaskId,
        })
        if (activeTaskId) {
          completeTaskPomodoro(activeTaskId)
        }
        // Celebrate completion!
        celebratePomodoroComplete(xpEarned)
        // Check if daily goal was just completed
        if (goals.dailyPomodoros && todayStats.completedPomodoros + 1 === goals.dailyPomodoros) {
          setTimeout(() => celebrateDailyGoal(), 1500)
        }
        // Check if this completed pomodoro triggers a long break
        // sessionPomodoros will be incremented by recordPomodoro, so we add 1 to current value
        const nextMode = (sessionPomodoros + 1) % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak"
        switchMode(nextMode)
        if (settings.autoStartBreaks) setTimerRunning(true)
      } else {
        switchMode("pomodoro")
        if (settings.autoStartPomodoros) setTimerRunning(true)
      }
    }

    return () => clearInterval(interval)
  }, [
    timer.isRunning,
    timer.timeLeft,
    timer.mode,
    timer.startDuration,
    sessionPomodoros,
    activeTaskId,
    settings,
    goals,
    todayStats.completedPomodoros,
    switchMode,
    recordPomodoro,
    completeTaskPomodoro,
    setTimeLeft,
    setTimerRunning,
    celebratePomodoroComplete,
    celebrateDailyGoal,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          playClick()
          if (!timer.isRunning) {
            track(MixpanelEvents.TIMER_STARTED, { mode: timer.mode })
          }
          setTimerRunning(!timer.isRunning)
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
          e.preventDefault()
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
  }, [switchMode, timer.isRunning, setTimerRunning, playClick])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAddTask = (task: { title: string; estimatedPomodoros: number; note?: string }) => {
    addTask(task)
  }

  const handleSkip = () => {
    if (timer.mode === "pomodoro" && timer.isRunning) {
      recordSkip()
    }
    if (timer.mode === "pomodoro") {
      // Skip always goes to short break - you didn't complete the pomodoro,
      // so you don't earn a long break
      switchMode("shortBreak")
    } else {
      switchMode("pomodoro")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/codefocus_logo_medium_no_bg.webp"
              alt="CodeFocus"
              width={377}
              height={415}
              className="h-10 w-auto dark:invert"
            />
            <span className="font-[family-name:var(--font-montserrat)] font-semibold tracking-tight text-lg">
              codefocus<span className="text-muted-foreground">.io</span>
            </span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Settings - Always Visible (leftmost) */}
            <Button
              id="settings-button"
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="text-xs gap-1.5 h-8 px-2.5 sm:px-3"
              aria-label={t('nav.settings')}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.settings')}</span>
              <kbd className="hidden lg:inline-flex ml-1 h-5 items-center px-1.5 bg-muted text-muted-foreground text-[10px]">
                S
              </kbd>
            </Button>

            {/* Desktop Navigation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAchievementsOpen(true)}
              className="hidden sm:flex text-xs gap-1.5 h-8 px-2.5 sm:px-3"
              aria-label={t('nav.badges')}
            >
              <Award className="h-4 w-4" />
              <span>{t('nav.badges')}</span>
            </Button>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="hidden sm:block">
              <AmbientSounds />
            </div>
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8" onClick={() => setShortcutsOpen(true)} aria-label="Keyboard shortcuts">
              <Keyboard className="h-4 w-4" />
            </Button>

            {/* Desktop Dropdown Menu - Report & Sign In (rightmost) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8" aria-label="More options">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setReportOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('nav.report')}
                  <kbd className="ml-auto text-[10px] text-muted-foreground">R</kbd>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/signin" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.signIn')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" aria-label="Menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setAchievementsOpen(true)}>
                  <Award className="h-4 w-4 mr-2" />
                  {t('nav.badges')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReportOpen(true)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t('nav.report')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/signin" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.signIn')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm">Sounds</span>
                  <AmbientSounds />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm">Language</span>
                  <LanguageSwitcher />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-6 sm:py-10">
        {isLoaded && <GoalProgress goalProgress={goalProgress} />}

        <div className="border border-border bg-card p-4 sm:p-8 shadow-sm">
          {/* Mode Tabs */}
          <div className="flex justify-center gap-1 mb-6 sm:mb-10">
            {(["pomodoro", "shortBreak", "longBreak"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-3 sm:px-4 py-2 text-xs font-medium tracking-wide transition-all duration-200 ${
                  timer.mode === m
                    ? "bg-foreground text-background border border-foreground"
                    : "text-muted-foreground border border-dashed border-border hover:text-foreground hover:border-foreground"
                }`}
              >
                {m === "pomodoro" ? t('timer.focus') : m === "shortBreak" ? t('timer.break') : t('timer.rest')}
              </button>
            ))}
          </div>

          {/* Timer Display with Progress Ring */}
          <div className="flex flex-col items-center mb-6 sm:mb-10">
            <div className="relative">
              <svg className="w-72 h-72 sm:w-96 sm:h-96 -rotate-90" viewBox="0 0 300 300">
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                />
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="square"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  className="text-foreground transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl sm:text-8xl font-light tracking-tighter tabular-nums">
                  {formatTime(timer.timeLeft)}
                </div>
                <div className="mt-2 text-center">
                  {activeTask ? (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[160px] sm:max-w-[200px]">
                      {activeTask.title}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {timer.mode === "pomodoro" ? t('timer.timeToFocus') : timer.mode === "shortBreak" ? t('timer.takeABreak') : t('timer.timeToRest')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3">
            <Button
              id="start-button"
              size="lg"
              className={`h-11 px-8 sm:px-12 text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center ${
                timer.isRunning
                  ? "bg-muted text-foreground hover:bg-muted/80"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
              onClick={() => {
                playClick()
                if (!timer.isRunning) {
                  track(MixpanelEvents.TIMER_STARTED, { mode: timer.mode })
                }
                setTimerRunning(!timer.isRunning)
              }}
            >
              {timer.isRunning ? t('timer.pause') : t('timer.start')}
              <kbd className="ml-2 mt-0.5 text-[10px] opacity-60 hidden sm:inline">space</kbd>
            </Button>
            {timer.isRunning && (
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

        {/* Task List */}
        <div className="mt-6 sm:mt-8">
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSelectTask={setActiveTask}
            onAddTask={() => setAddTaskOpen(true)}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </div>

        {/* Stats & Activity */}
        {isLoaded && (
          <div className="mt-6 sm:mt-8">
            <StatsCard
              totalXP={stats.totalFocusMinutes}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              todayPomodoros={todayStats.completedPomodoros}
              level={level}
              personalRecords={stats.personalRecords}
            />
            <div className="mt-4 sm:mt-6">
              <StreakHeatmap data={heatmapData} />
            </div>
          </div>
        )}

        {/* Premium Banner */}
        <Link href="/premium" className="block mt-6 sm:mt-8">
          <div className="border border-border p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t('premium.unlock')}</span>
            </div>
            <span className="text-xs text-muted-foreground group-hover:translate-x-0.5 transition-transform">
              {t('premium.learnMore')} →
            </span>
          </div>
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-16">
        <div className="max-w-xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CodeFocus</p>
            <div className="flex items-center gap-4">
              <Link href="/premium" className="hover:text-foreground transition-colors">Premium</Link>
              <a href="mailto:hello@codefocus.io" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        goals={goals}
        onSettingsChange={updateSettings}
        onGoalsChange={setGoals}
        onOpen={startSettingsTour}
      />
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        stats={stats}
        tasks={tasks}
        todayStats={todayStats}
        goalProgress={goalProgress}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} onAddTask={handleAddTask} />
      <AchievementsDialog
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        achievements={achievements}
        markAchievementsSeen={markAchievementsSeen}
      />
      <LevelUpModal
        open={levelUpOpen}
        onOpenChange={setLevelUpOpen}
        level={level}
      />
    </div>
  )
}
