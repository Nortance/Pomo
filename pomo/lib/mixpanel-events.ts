/**
 * Mixpanel Event Constants
 *
 * All tracked events in one place for:
 * - Type safety
 * - Easy auditing
 * - Consistent naming
 *
 * Naming convention: NOUN_VERB (e.g., TIMER_STARTED, POMODORO_COMPLETED)
 */

export const MixpanelEvents = {
  // ============================================
  // PRIMARY CONVERSION EVENTS (for Google Ads)
  // ============================================

  /** User started the timer (any mode) */
  TIMER_STARTED: 'Timer Started',

  /** User completed a full pomodoro session */
  POMODORO_COMPLETED: 'Pomodoro Completed',

  /** User viewed the premium/pricing page */
  PREMIUM_PAGE_VIEWED: 'Premium Page Viewed',

  // ============================================
  // SECONDARY ENGAGEMENT EVENTS
  // ============================================

  /** User added a new task */
  TASK_ADDED: 'Task Added',

  /** User unlocked an achievement */
  ACHIEVEMENT_UNLOCKED: 'Achievement Unlocked',

  // ============================================
  // UI INTERACTION EVENTS
  // ============================================

  /** User changed the theme (light/dark/cute) */
  THEME_CHANGED: 'Theme Changed',

  /** User toggled ambient sounds on/off */
  AMBIENT_SOUND_TOGGLED: 'Ambient Sound Toggled',

  /** User changed ambient sound type */
  AMBIENT_SOUND_CHANGED: 'Ambient Sound Changed',

  /** User changed language/locale */
  LANGUAGE_CHANGED: 'Language Changed',

  // ============================================
  // CONTENT EVENTS
  // ============================================

  /** User viewed an article */
  ARTICLE_VIEWED: 'Article Viewed',
} as const

export type MixpanelEvent = typeof MixpanelEvents[keyof typeof MixpanelEvents]
