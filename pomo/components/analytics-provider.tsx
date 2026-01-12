"use client"

import { useEffect } from "react"
import { initAnalytics } from "@/lib/analytics"

/**
 * Analytics provider that initializes Mixpanel on mount
 * Uses requestIdleCallback to not block initial render
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics()
  }, [])

  return <>{children}</>
}
