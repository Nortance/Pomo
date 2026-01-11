/**
 * Device identification for sync
 */

import type { SyncMetadata } from './types'
import { SYNC_METADATA_KEY } from './types'

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  return crypto.randomUUID()
}

/**
 * Get or create the sync metadata for this device
 */
export function getSyncMetadata(): SyncMetadata {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server',
      userId: null,
      lastSyncedAt: null,
      lastSyncedStats: null,
    }
  }

  const stored = localStorage.getItem(SYNC_METADATA_KEY)

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as SyncMetadata
      // Ensure deviceId exists (migration from older versions)
      if (!parsed.deviceId) {
        parsed.deviceId = generateDeviceId()
        saveSyncMetadata(parsed)
      }
      return parsed
    } catch {
      // Invalid data, create fresh
    }
  }

  // Create new sync metadata
  const metadata: SyncMetadata = {
    deviceId: generateDeviceId(),
    userId: null,
    lastSyncedAt: null,
    lastSyncedStats: null,
  }

  saveSyncMetadata(metadata)
  return metadata
}

/**
 * Save sync metadata to localStorage
 */
export function saveSyncMetadata(metadata: SyncMetadata): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(metadata))
}

/**
 * Update sync metadata after successful sync
 */
export function updateSyncCheckpoint(
  userId: string,
  stats: SyncMetadata['lastSyncedStats']
): void {
  const metadata = getSyncMetadata()

  saveSyncMetadata({
    ...metadata,
    userId,
    lastSyncedAt: new Date().toISOString(),
    lastSyncedStats: stats,
  })
}

/**
 * Clear user-specific sync data on logout
 * Keeps deviceId but clears user association
 */
export function clearUserSyncData(): void {
  const metadata = getSyncMetadata()

  saveSyncMetadata({
    ...metadata,
    userId: null,
    // Keep lastSyncedAt and lastSyncedStats for delta calculation on re-login
  })
}
