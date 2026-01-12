/**
 * Analytics module using Mixpanel
 *
 * Following official Mixpanel Next.js best practices:
 * @see https://docs.mixpanel.com/docs/tracking-methods/integrations/nextjs
 *
 * Design principles:
 * - Lazy load Mixpanel to not block initial render
 * - Queue events before initialization completes
 * - Simple API: just track(event, properties)
 * - SSR safe
 * - Autocapture enabled for automatic click/form tracking
 * - SPA-aware page view tracking
 */

// Re-export events for convenience
import { MixpanelEvents, type MixpanelEvent } from './mixpanel-events'
export { MixpanelEvents, type MixpanelEvent }

// Types
type MixpanelInstance = {
  init: (token: string, config?: Record<string, unknown>) => void
  track: (event: string, properties?: Record<string, unknown>) => void
  identify: (id: string) => void
  reset: () => void
}

type QueuedEvent = {
  event: string
  properties?: Record<string, unknown>
}

// Module state
let mixpanel: MixpanelInstance | null = null
let isInitializing = false
let isInitialized = false
const eventQueue: QueuedEvent[] = []

/**
 * Initialize Mixpanel lazily
 * Called automatically on first track() call
 */
async function initMixpanel(): Promise<void> {
  if (typeof window === 'undefined') return
  if (isInitialized || isInitializing) return

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] NEXT_PUBLIC_MIXPANEL_TOKEN not set, tracking disabled')
    }
    return
  }

  isInitializing = true

  try {
    // Dynamic import - only loads when needed
    const mixpanelModule = await import('mixpanel-browser')
    mixpanel = mixpanelModule.default

    mixpanel.init(token, {
      // Proxy through our domain to bypass ad blockers
      // @see https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript#tracking-via-proxy
      api_host: '/mp',
      debug: process.env.NODE_ENV === 'development',
      // SPA page view tracking - tracks on path changes (recommended for Next.js App Router)
      // @see https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript#tracking-page-views
      track_pageview: 'url-with-path',
      persistence: 'localStorage',
      ignore_dnt: false, // Respect Do Not Track
      // Autocapture for automatic click, form, and interaction tracking
      // @see https://docs.mixpanel.com/docs/tracking-methods/autocapture
      autocapture: {
        pageview: 'url-with-path', // Track SPA route changes
        click: true,               // Track button/link clicks
        input: false,              // Don't capture input values (privacy)
        scroll: false,             // Skip scroll tracking (noisy)
        submit: true,              // Track form submissions
        capture_text_content: false, // Don't capture text (privacy)
      },
    })

    isInitialized = true
    isInitializing = false

    // Flush queued events
    while (eventQueue.length > 0) {
      const { event, properties } = eventQueue.shift()!
      mixpanel.track(event, properties)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Mixpanel initialized with autocapture')
    }
  } catch (error) {
    isInitializing = false
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to initialize Mixpanel:', error)
    }
  }
}

/**
 * Track an event
 *
 * @example
 * track(MixpanelEvents.TIMER_STARTED, { mode: 'pomodoro' })
 */
export function track(event: MixpanelEvent | string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  const enrichedProperties = {
    ...properties,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    referrer: document.referrer || undefined,
  }

  if (isInitialized && mixpanel) {
    mixpanel.track(event, enrichedProperties)
  } else {
    // Queue event and trigger initialization
    eventQueue.push({ event, properties: enrichedProperties })
    initMixpanel()
  }
}

/**
 * Initialize analytics (call once on app mount)
 * This pre-warms the Mixpanel SDK
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return

  // Delay initialization to not block render
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initMixpanel(), { timeout: 2000 })
  } else {
    setTimeout(() => initMixpanel(), 1000)
  }
}

/**
 * Identify a user (for when auth is added)
 */
export function identify(userId: string): void {
  if (typeof window === 'undefined') return

  if (isInitialized && mixpanel) {
    mixpanel.identify(userId)
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetAnalytics(): void {
  if (typeof window === 'undefined') return

  if (isInitialized && mixpanel) {
    mixpanel.reset()
  }
}
