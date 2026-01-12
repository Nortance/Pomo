"use client"

import { Flame, Zap, TrendingUp } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"
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
  const { t } = useTranslations()

  // Check if current streak is the longest
  const isNewRecord = longestStreak !== undefined && currentStreak > 0 && currentStreak >= longestStreak

  return (
    <div>
      <h2 className="text-xs sm:text-sm font-medium tracking-wide mb-3 sm:mb-4">{t('stats.title')}</h2>
      <div className="border border-border bg-card rounded-xl overflow-hidden">
      {level && (
        <div className="border-b border-border px-4 sm:px-5 py-4 sm:py-5 bg-muted/30">
          <div className="flex items-center gap-4">
            {/* Ghost Icon - Prominent focal point */}
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background/50 border border-border flex items-center justify-center">
              <Image
                src={levelIcons[level.name] || levelIcons.Apprentice}
                alt={level.name}
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </div>

            {/* Level Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm sm:text-base font-medium tracking-wide">{level.name}</span>
                <span className="text-xs text-muted-foreground">{t('stats.level')} {level.tier}</span>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  {level.nextTier ? (
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, level.progress)}%` }}
                    />
                  ) : (
                    <div className="h-full bg-foreground rounded-full" />
                  )}
                </div>
                {level.nextTier && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">
                    {Math.round(level.progress)}%
                  </span>
                )}
              </div>
            </div>
          </div>
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
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">{t('stats.xpMinutes')}</p>
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
              {isNewRecord ? t('stats.best') : t('stats.streak')}
            </p>
          </div>

          {/* Today's Pomodoros */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
            <p className="text-lg sm:text-2xl font-light tabular-nums">{todayPomodoros}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">{t('stats.today')}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
