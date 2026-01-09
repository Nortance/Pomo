"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  const ghostIcon = levelIcons[level.name] || "/ghosts/ghost-apprentice.webp"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogTitle className="sr-only">Level Up!</DialogTitle>
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
          <h2 className="text-2xl sm:text-3xl font-light mb-2">Level Up!</h2>
          <p className="text-lg sm:text-xl font-medium mb-1">{level.name}</p>
          <p className="text-sm text-muted-foreground mb-6">Level {level.tier}</p>
          <div className="space-y-2 mb-6 px-4">
            <p className="text-xs text-muted-foreground">
              {level.name === "Apprentice" && "Your focus journey begins! Every minute counts."}
              {level.name === "Craftsman" && "25 hours of focused work! You're building mastery."}
              {level.name === "Master" && "100 hours achieved! True dedication pays off."}
              {level.name === "Grandmaster" && "500 hours! You've reached legendary status."}
            </p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="px-8">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
