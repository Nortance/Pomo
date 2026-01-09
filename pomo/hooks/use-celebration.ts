"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useConfetti } from "./use-confetti"
import { useSound } from "./use-sound"

interface CelebrationOptions {
  soundEnabled: boolean
}

export function useCelebration({ soundEnabled }: CelebrationOptions) {
  const { fireGhostConfetti, fireLevelUpConfetti, fireAchievementConfetti } = useConfetti()
  const { playCompletion, playLevelUp, playAchievement } = useSound(soundEnabled)

  const celebratePomodoroComplete = useCallback(
    (xpEarned: number) => {
      fireGhostConfetti()
      playCompletion()
      toast("Focus complete!", {
        description: `+${xpEarned} XP earned`,
        icon: "👻",
        duration: 3000,
      })
    },
    [fireGhostConfetti, playCompletion]
  )

  const celebrateLevelUp = useCallback(
    (newLevel: string, tier: number) => {
      fireLevelUpConfetti()
      playLevelUp()
      toast.success(`Level Up!`, {
        description: `You reached ${newLevel} (Level ${tier})!`,
        icon: "🎉",
        duration: 5000,
      })
    },
    [fireLevelUpConfetti, playLevelUp]
  )

  const celebrateAchievement = useCallback(
    (achievementName: string, description: string) => {
      fireAchievementConfetti()
      playAchievement()
      toast("Achievement Unlocked!", {
        description: `${achievementName}: ${description}`,
        icon: "🏆",
        duration: 4000,
      })
    },
    [fireAchievementConfetti, playAchievement]
  )

  const celebrateStreak = useCallback(
    (streakDays: number) => {
      fireGhostConfetti()
      playCompletion()
      toast(`${streakDays} Day Streak!`, {
        description: "Keep the momentum going!",
        icon: "🔥",
        duration: 3000,
      })
    },
    [fireGhostConfetti, playCompletion]
  )

  const celebrateDailyGoal = useCallback(() => {
    fireGhostConfetti()
    playCompletion()
    toast("Daily Goal Complete!", {
      description: "You crushed today's goal!",
      icon: "⭐",
      duration: 3000,
    })
  }, [fireGhostConfetti, playCompletion])

  return {
    celebratePomodoroComplete,
    celebrateLevelUp,
    celebrateAchievement,
    celebrateStreak,
    celebrateDailyGoal,
  }
}
