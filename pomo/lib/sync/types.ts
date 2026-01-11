/**
 * Types for Clerk data synchronization
 */

import type { Stats, Task, Settings, Goals, UnlockedAchievement } from '../types'

/**
 * Data structure stored in Clerk unsafeMetadata
 * Keep this under 8KB limit by:
 * - Only storing incomplete tasks (max 20)
 * - Archiving completed tasks locally
 *
 * Note: Index signature required for Clerk's UserUnsafeMetadata compatibility
 */
export interface ClerkUserData {
  [key: string]: unknown // Required for Clerk compatibility
  version: number
  stats: Stats
  tasks: Task[] // Only incomplete tasks, max 20
  settings: Settings
  goals: Goals
  achievements: UnlockedAchievement[]
  lastSyncedAt: string // ISO timestamp
}

/**
 * Local sync metadata stored in localStorage
 * Used to track sync state and calculate deltas
 */
export interface SyncMetadata {
  deviceId: string                    // Unique device identifier (UUID)
  userId: string | null               // Clerk user ID when logged in
  lastSyncedAt: string | null         // ISO timestamp of last successful sync
  lastSyncedStats: Stats | null       // Snapshot of stats at last sync (for delta calculation)
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  data: ClerkUserData
  hasChanges: boolean
  conflicts: string[] // Description of any conflicts that were resolved
}

/**
 * Sync status for UI feedback
 */
export type SyncStatus =
  | 'idle'           // Not syncing
  | 'syncing'        // Sync in progress
  | 'synced'         // Successfully synced
  | 'offline'        // No network connection
  | 'error'          // Sync failed

/**
 * Storage keys
 */
export const SYNC_METADATA_KEY = 'codefocus-sync-metadata'
export const CLERK_DATA_VERSION = 1

/**
 * Limits for Clerk metadata storage
 */
export const MAX_TASKS_IN_CLERK = 20 // Only store incomplete tasks
export const MAX_DAILY_STATS_DAYS = 365 // Keep 1 year of daily stats
