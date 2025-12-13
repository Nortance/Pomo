"use client"

import { Flame, Clock, Target, TrendingUp, Trophy } from "lucide-react"
import type { PersonalRecords, Level } from "@/lib/types"

interface StatsCardProps {
  focusScore: number
  currentStreak: number
  longestStreak?: number
  totalHours: number
  totalMinutes: number
  todayPomodoros: number
  level?: Level
  personalRecords?: PersonalRecords
}

export function StatsCard({
  focusScore,
  currentStreak,
  longestStreak,
  totalHours,
  totalMinutes,
  todayPomodoros,
  level,
  personalRecords,
}: StatsCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-foreground"
    if (score >= 60) return "text-muted-foreground"
    return "text-muted-foreground/60"
  }

  // Check if current streak is the longest
  const isNewRecord = longestStreak !== undefined && currentStreak > 0 && currentStreak >= longestStreak

  return (
    <div className="border border-border bg-card mb-4 sm:mb-6">
      {level && (
        <div className="border-b border-border px-3 sm:px-4 py-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium tracking-wide">{level.name}</span>
            <span className="text-[10px] text-muted-foreground">Level {level.tier}</span>
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {/* Focus Score */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
            <p className={`text-lg sm:text-2xl font-light tabular-nums ${getScoreColor(focusScore)}`}>{focusScore}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Score</p>
          </div>

          {/* Current Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Flame className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isNewRecord ? "text-orange-500" : "text-muted-foreground"}`} />
            </div>
            <p className="text-lg sm:text-2xl font-light tabular-nums">
              {currentStreak}
              <span className="text-xs sm:text-sm text-muted-foreground">d</span>
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">
              {isNewRecord ? "Best!" : "Streak"}
            </p>
          </div>

          {/* Deep Work Hours */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
            <p className="text-lg sm:text-2xl font-light tabular-nums">
              {totalHours > 0 ? (
                <>
                  {totalHours}
                  <span className="text-xs sm:text-sm text-muted-foreground">h</span>
                </>
              ) : (
                <>
                  {totalMinutes}
                  <span className="text-xs sm:text-sm text-muted-foreground">m</span>
                </>
              )}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
          </div>

          {/* Today's Pomodoros */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
            <p className="text-lg sm:text-2xl font-light tabular-nums">{todayPomodoros}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">Today</p>
          </div>
        </div>
      </div>
    </div>
  )
}
