"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"
import Image from "next/image"
import type { Level } from "@/lib/types"

interface LevelUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level: Level
}

// Map level name to ghost icon
const levelIcons: Record<string, string> = {
  Apprentice: "/ghosts/ghost-apprentice.webp",
  Craftsman: "/ghosts/ghost-craftsman.webp",
  Master: "/ghosts/ghost-master.webp",
  Grandmaster: "/ghosts/ghost-grandmaster.webp",
}

export function LevelUpModal({ open, onOpenChange, level }: LevelUpModalProps) {
  const { t } = useTranslations()
  const ghostIcon = levelIcons[level.name] || "/ghosts/ghost-apprentice.webp"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogTitle className="sr-only">{t('levelUp.title')}</DialogTitle>
        <div className="py-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-foreground/10 blur-xl rounded-full scale-150" />
              <Image
                src={ghostIcon}
                alt={level.name}
                width={120}
                height={120}
                className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain animate-bounce"
              />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light mb-2">{t('levelUp.title')}</h2>
          <p className="text-lg sm:text-xl font-medium mb-1">{level.name}</p>
          <p className="text-sm text-muted-foreground mb-6">{t('stats.level')} {level.tier}</p>
          <div className="space-y-2 mb-6 px-4">
            <p className="text-xs text-muted-foreground">
              {level.name === "Apprentice" && t('levelUp.apprenticeDesc')}
              {level.name === "Craftsman" && t('levelUp.craftsmanDesc')}
              {level.name === "Master" && t('levelUp.masterDesc')}
              {level.name === "Grandmaster" && t('levelUp.grandmasterDesc')}
            </p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="px-8">
            {t('common.continue')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
