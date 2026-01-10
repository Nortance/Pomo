"use client"

import { useEffect, useState, useCallback } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const TOURS_COOKIE = "codefocus-tours"

interface ToursState {
  main?: boolean
  settings?: boolean
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

function getToursState(): ToursState {
  const cookie = getCookie(TOURS_COOKIE)
  if (!cookie) return {}
  try {
    return JSON.parse(decodeURIComponent(cookie))
  } catch {
    return {}
  }
}

function setTourSeen(tour: keyof ToursState) {
  const state = getToursState()
  state[tour] = true
  setCookie(TOURS_COOKIE, encodeURIComponent(JSON.stringify(state)), 365)
}

export function useOnboarding() {
  const [hasSeenMain, setHasSeenMain] = useState(true)
  const [hasSeenSettings, setHasSeenSettings] = useState(true)

  // Main tour - runs on first visit
  useEffect(() => {
    const state = getToursState()
    if (state.main) {
      setHasSeenMain(true)
      return
    }

    setHasSeenMain(false)

    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: false,
        doneBtnText: "Got it",
        steps: [
          {
            element: "#start-button",
            popover: {
              description: "You start your pomo here.",
              side: "top",
              align: "center",
              popoverClass: "first-step",
            },
          },
          {
            element: "#settings-button",
            popover: {
              description: "You set your pomo time here.",
              side: "bottom",
              align: "center",
            },
          },
        ],
        onDestroyStarted: () => {
          setTourSeen("main")
          setHasSeenMain(true)
          driverObj.destroy()
        },
      })

      driverObj.drive()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  // Settings tour - called when settings dialog opens
  const startSettingsTour = useCallback(() => {
    const state = getToursState()
    if (state.settings) {
      return
    }

    setTimeout(() => {
      const driverObj = driver({
        showProgress: false,
        doneBtnText: "Got it",
        steps: [
          {
            element: "#focus-duration-input",
            popover: {
              description: "Set pomo time here.",
              side: "bottom",
              align: "center",
              popoverClass: "first-step",
            },
          },
        ],
        onDestroyStarted: () => {
          setTourSeen("settings")
          setHasSeenSettings(true)
          driverObj.destroy()
        },
      })

      driverObj.drive()
    }, 300)
  }, [])

  return { hasSeenMain, hasSeenSettings, startSettingsTour }
}
