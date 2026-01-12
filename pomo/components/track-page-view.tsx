"use client"

import { useEffect } from "react"
import { track } from "@/lib/analytics"

interface TrackPageViewProps {
  event: string
  properties?: Record<string, unknown>
}

/**
 * Client component to track page views in server components
 * Just renders nothing but tracks on mount
 */
export function TrackPageView({ event, properties }: TrackPageViewProps) {
  useEffect(() => {
    track(event, properties)
  }, [event, properties])

  return null
}
