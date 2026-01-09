"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ACHIEVEMENTS, getUnlockedCount } from "@/lib/achievements"
import Image from "next/image"

interface AchievementsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unlockedIds: string[]
}

export function AchievementsDialog({
  open,
  onOpenChange,
  unlockedIds,
}: AchievementsDialogProps) {
  const { unlocked, total } = getUnlockedCount(unlockedIds)

  // Group achievements by category
  const categories = [
    { id: 'milestone', name: 'Milestones', achievements: ACHIEVEMENTS.filter((a) => a.category === 'milestone') },
    { id: 'streak', name: 'Streaks', achievements: ACHIEVEMENTS.filter((a) => a.category === 'streak') },
    { id: 'level', name: 'Levels', achievements: ACHIEVEMENTS.filter((a) => a.category === 'level') },
    { id: 'special', name: 'Special', achievements: ACHIEVEMENTS.filter((a) => a.category === 'special') },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wide flex items-center justify-between">
            <span>Achievements</span>
            <span className="text-xs text-muted-foreground font-normal">
              {unlocked}/{total} unlocked
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
                            : "border-border bg-muted/20 opacity-40 grayscale"
                        }`}
                      >
                        <Image
                          src={achievement.icon}
                          alt={achievement.name}
                          width={40}
                          height={40}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <span className="text-lg">?</span>
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
