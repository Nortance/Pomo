"use client"

import { useRef, useCallback, useEffect } from "react"
import JSConfetti from "js-confetti"

export function useConfetti() {
  const confettiRef = useRef<JSConfetti | null>(null)

  useEffect(() => {
    // Only create instance on client side
    confettiRef.current = new JSConfetti()
    return () => {
      confettiRef.current = null
    }
  }, [])

  const fireGhostConfetti = useCallback(() => {
    if (!confettiRef.current) return
    confettiRef.current.addConfetti({
      emojis: ["👻"],
      emojiSize: 60,
      confettiNumber: 30,
    })
  }, [])

  const fireLevelUpConfetti = useCallback(() => {
    if (!confettiRef.current) return
    confettiRef.current.addConfetti({
      emojis: ["👻", "⭐", "🎉", "✨"],
      emojiSize: 80,
      confettiNumber: 50,
    })
  }, [])

  const fireAchievementConfetti = useCallback(() => {
    if (!confettiRef.current) return
    confettiRef.current.addConfetti({
      emojis: ["👻", "🏆"],
      emojiSize: 70,
      confettiNumber: 40,
    })
  }, [])

  return {
    fireGhostConfetti,
    fireLevelUpConfetti,
    fireAchievementConfetti,
  }
}
