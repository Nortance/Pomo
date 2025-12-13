"use client"

import { Target } from "lucide-react"

interface GoalProgressProps {
  goalProgress: {
    daily: { current: number; target: number | null; percentage: number | null }
    weekly: { current: number; target: number | null; percentage: number | null }
  }
}

export function GoalProgress({ goalProgress }: GoalProgressProps) {
  const hasGoals = goalProgress.daily.target || goalProgress.weekly.target

  if (!hasGoals) return null

  return (
    <div className="border border-border bg-card p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Goals</span>
      </div>

      <div className="space-y-3">
        {/* Daily Goal */}
        {goalProgress.daily.target && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Daily Pomo Target</span>
              <span className="text-xs tabular-nums font-medium">
                {goalProgress.daily.current}/{goalProgress.daily.target}
              </span>
            </div>
            <div className="h-1.5 bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${goalProgress.daily.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Weekly Goal */}
        {goalProgress.weekly.target && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Weekly Pomo Target</span>
              <span className="text-xs tabular-nums font-medium">
                {goalProgress.weekly.current}/{goalProgress.weekly.target}
              </span>
            </div>
            <div className="h-1.5 bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-300"
                style={{ width: `${goalProgress.weekly.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
