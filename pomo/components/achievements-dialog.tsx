"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ACHIEVEMENTS, getUnlockedCount } from "@/lib/achievements"
import { useTranslations } from "@/hooks/use-translations"
import type { UnlockedAchievement } from "@/lib/types"
import Image from "next/image"
import { useMemo } from "react"

interface AchievementsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  achievements: UnlockedAchievement[]
  markAchievementsSeen: (ids: string[]) => void
}

export function AchievementsDialog({
  open,
  onOpenChange,
  achievements,
  markAchievementsSeen,
}: AchievementsDialogProps) {
  const { t } = useTranslations()
  const unlockedIds = useMemo(() => achievements.map((a) => a.id), [achievements])
  const { unlocked, total } = getUnlockedCount(unlockedIds)

  // Find achievements that are unlocked but not yet seen (should animate)
  const newAchievementIds = useMemo(
    () => achievements.filter((a) => !a.seenAt).map((a) => a.id),
    [achievements]
  )

  // Handle dialog close - mark new achievements as seen
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && newAchievementIds.length > 0) {
      markAchievementsSeen(newAchievementIds)
    }
    onOpenChange(newOpen)
  }

  // Group achievements by category
  const categories = [
    { id: 'milestone', name: t('achievements.milestones'), achievements: ACHIEVEMENTS.filter((a) => a.category === 'milestone') },
    { id: 'streak', name: t('achievements.streaks'), achievements: ACHIEVEMENTS.filter((a) => a.category === 'streak') },
    { id: 'level', name: t('achievements.levels'), achievements: ACHIEVEMENTS.filter((a) => a.category === 'level') },
    { id: 'special', name: t('achievements.special'), achievements: ACHIEVEMENTS.filter((a) => a.category === 'special') },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide flex items-center justify-between">
            <span>{t('achievements.title')}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {t('achievements.unlocked', { unlocked, total })}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="text-xs text-muted-foreground tracking-wide uppercase mb-3">
                {category.name}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {category.achievements.map((achievement) => {
                  const isUnlocked = unlockedIds.includes(achievement.id)
                  const isNew = newAchievementIds.includes(achievement.id)
                  return (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center group"
                      title={`${achievement.name}: ${achievement.description}`}
                    >
                      <div
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border transition-all ${
                          isUnlocked
                            ? "border-foreground bg-muted/50"
                            : "border-border bg-muted/20"
                        } ${isNew ? "animate-achievement-glow" : ""}`}
                      >
                        <Image
                          src={achievement.icon}
                          alt={achievement.name}
                          width={40}
                          height={40}
                          className={`w-8 h-8 sm:w-10 sm:h-10 object-contain transition-all ${
                            !isUnlocked ? "blur-[6px] opacity-50" : ""
                          }`}
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-medium text-muted-foreground">?</span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[9px] sm:text-[10px] text-center leading-tight ${
                          isUnlocked ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {isUnlocked ? achievement.name : "???"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
