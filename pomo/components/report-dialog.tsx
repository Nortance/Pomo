"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Calendar, Flame, Trophy, Target, TrendingUp } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import type { Stats, Task, DayStats, GoalProgress } from "@/lib/types"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: Stats
  tasks: Task[]
  todayStats: DayStats
  goalProgress: GoalProgress
}

export function ReportDialog({ open, onOpenChange, stats, tasks, todayStats, goalProgress }: ReportDialogProps) {
  const { t } = useTranslations()
  const hours = Math.floor(stats.totalFocusMinutes / 60)
  const minutes = stats.totalFocusMinutes % 60

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide">{t('report.title')}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Today's Stats */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs text-muted-foreground tracking-wide uppercase">{t('report.today')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border p-4 text-center">
                <Target className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{todayStats.completedPomodoros}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('report.pomodoros')}</p>
              </div>
              <div className="border border-border p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{todayStats.focusMinutes}m</p>
                <p className="text-xs text-muted-foreground mt-1">{t('report.focused')}</p>
              </div>
              <div className="border border-border p-4 text-center">
                <Flame className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{stats.currentStreak}d</p>
                <p className="text-xs text-muted-foreground mt-1">{t('report.streak')}</p>
              </div>
            </div>
          </div>

          {/* Goal Progress */}
          {(goalProgress.daily.target || goalProgress.weekly.target) && (
            <div className="space-y-4 mb-8">
              <h3 className="text-xs text-muted-foreground tracking-wide uppercase">{t('report.goals')}</h3>
              <div className="space-y-3">
                {goalProgress.daily.target && (
                  <div className="border border-border p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">{t('goals.dailyTarget')}</span>
                      <span className="text-sm tabular-nums">
                        {goalProgress.daily.current}/{goalProgress.daily.target}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all duration-300"
                        style={{ width: `${goalProgress.daily.percentage || 0}%` }}
                      />
                    </div>
                  </div>
                )}
                {goalProgress.weekly.target && (
                  <div className="border border-border p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">{t('goals.weeklyTarget')}</span>
                      <span className="text-sm tabular-nums">
                        {goalProgress.weekly.current}/{goalProgress.weekly.target}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground transition-all duration-300"
                        style={{ width: `${goalProgress.weekly.percentage || 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Time Stats */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs text-muted-foreground tracking-wide uppercase">{t('report.allTime')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">
                  {hours > 0 ? `${hours}h` : `${minutes}m`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t('report.totalFocus')}</p>
              </div>
              <div className="border border-border p-4 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{stats.totalPomodoros}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('report.pomodoros')}</p>
              </div>
              <div className="border border-border p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-light tabular-nums">{stats.longestStreak}d</p>
                <p className="text-xs text-muted-foreground mt-1">{t('report.bestStreak')}</p>
              </div>
            </div>
          </div>

          {/* Personal Records */}
          {(stats.personalRecords.mostProductiveDay || stats.personalRecords.mostProductiveWeek) && (
            <div className="space-y-4 mb-8">
              <h3 className="text-xs text-muted-foreground tracking-wide uppercase">{t('report.personalRecords')}</h3>
              <div className="space-y-2">
                {stats.personalRecords.mostProductiveDay && (
                  <div className="flex items-center justify-between border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{t('report.mostProductiveDay')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular-nums font-medium">
                        {stats.personalRecords.mostProductiveDay.pomodoros} {t('report.pomodoros')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(stats.personalRecords.mostProductiveDay.date)}
                      </p>
                    </div>
                  </div>
                )}
                {stats.personalRecords.mostProductiveWeek && (
                  <div className="flex items-center justify-between border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{t('report.mostProductiveWeek')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular-nums font-medium">
                        {stats.personalRecords.mostProductiveWeek.pomodoros} {t('report.pomodoros')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('report.weekOf')} {formatDate(stats.personalRecords.mostProductiveWeek.startDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Summary */}
          {tasks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs text-muted-foreground tracking-wide uppercase">
                {t('report.tasks')} ({completedTasks}/{totalTasks} {t('tasks.complete')})
              </h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                  >
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {task.completedPomodoros}/{task.estimatedPomodoros}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && stats.totalPomodoros === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('report.noActivityYet')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
