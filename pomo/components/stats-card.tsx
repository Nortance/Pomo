"use client"

import { Flame, Zap, TrendingUp } from "lucide-react"
import Image from "next/image"
import type { PersonalRecords, Level } from "@/lib/types"

// Map level name to ghost icon
const levelIcons: Record<string, string> = {
  Apprentice: "/ghosts/ghost-apprentice.webp",
  Craftsman: "/ghosts/ghost-craftsman.webp",
  Master: "/ghosts/ghost-master.webp",
  Grandmaster: "/ghosts/ghost-grandmaster.webp",
}

interface StatsCardProps {
  totalXP: number
  currentStreak: number
  longestStreak?: number
  todayPomodoros: number
  level?: Level
  personalRecords?: PersonalRecords
}

export function StatsCard({
  totalXP,
  currentStreak,
  longestStreak,
  todayPomodoros,
  level,
}: StatsCardProps) {

  // Check if current streak is the longest
  const isNewRecord = longestStreak !== undefined && currentStreak > 0 && currentStreak >= longestStreak

  return (
    <div>
      <h2 className="text-xs sm:text-sm font-medium tracking-wide mb-3 sm:mb-4">Stats</h2>
      <div className="border border-border bg-card">
      {level && (
        <div className="border-b border-border px-3 sm:px-4 py-2.5 bg-muted/30">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Image
                src={levelIcons[level.name] || levelIcons.Apprentice}
                alt={level.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
              <span className="text-xs font-medium tracking-wide">{level.name}</span>
              <span className="text-[10px] text-muted-foreground">Level {level.tier}</span>
            </div>
            {level.nextTier && (
              <span className="text-[10px] text-muted-foreground">
                {Math.round(level.progress)}% to next
              </span>
            )}
          </div>
          {level.nextTier ? (
            <div className="h-1 bg-border overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, level.progress)}%` }}
              />
            </div>
          ) : (
            <div className="h-1 bg-foreground" />
          )}
        </div>
      )}

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* XP (Total Focus Minutes) */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
            <p className="text-lg sm:text-2xl font-light tabular-nums">
              {totalXP.toLocaleString()}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">XP (min)</p>
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
    </div>
  )
}
