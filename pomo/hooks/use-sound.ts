"use client"

import { useCallback, useRef, useEffect } from "react"

// Sound URLs
const COMPLETION_SOUND_URL = "/sounds/completion.mp3"
const LEVEL_UP_SOUND_URL = "/sounds/level-up.mp3"
const ACHIEVEMENT_SOUND_URL = "/sounds/achievement.mp3"
const CLICK_SOUND_URL = "/sounds/click.mp3"

export function useSound(enabled: boolean) {
  const completionAudioRef = useRef<HTMLAudioElement | null>(null)
  const levelUpAudioRef = useRef<HTMLAudioElement | null>(null)
  const achievementAudioRef = useRef<HTMLAudioElement | null>(null)
  const clickAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Pre-load sounds on client side
    if (typeof window !== "undefined") {
      completionAudioRef.current = new Audio(COMPLETION_SOUND_URL)
      completionAudioRef.current.volume = 0.5

      levelUpAudioRef.current = new Audio(LEVEL_UP_SOUND_URL)
      levelUpAudioRef.current.volume = 0.6

      achievementAudioRef.current = new Audio(ACHIEVEMENT_SOUND_URL)
      achievementAudioRef.current.volume = 0.5

      clickAudioRef.current = new Audio(CLICK_SOUND_URL)
      clickAudioRef.current.volume = 0.3
    }
  }, [])

  const playCompletion = useCallback(() => {
    if (!enabled || !completionAudioRef.current) return
    completionAudioRef.current.currentTime = 0
    completionAudioRef.current.play().catch(() => {
      // Ignore autoplay errors
    })
  }, [enabled])

  const playLevelUp = useCallback(() => {
    if (!enabled || !levelUpAudioRef.current) return
    levelUpAudioRef.current.currentTime = 0
    levelUpAudioRef.current.play().catch(() => {
      // Ignore autoplay errors
    })
  }, [enabled])

  const playAchievement = useCallback(() => {
    if (!enabled || !achievementAudioRef.current) return
    achievementAudioRef.current.currentTime = 0
    achievementAudioRef.current.play().catch(() => {
      // Ignore autoplay errors
    })
  }, [enabled])

  const playClick = useCallback(() => {
    if (!enabled || !clickAudioRef.current) return
    clickAudioRef.current.currentTime = 0
    clickAudioRef.current.play().catch(() => {
      // Ignore autoplay errors
    })
  }, [enabled])

  return {
    playCompletion,
    playLevelUp,
    playAchievement,
    playClick,
  }
}
