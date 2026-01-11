"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import type { PersistedState } from '@/lib/types'
import type { ClerkUserData, SyncStatus } from '@/lib/sync'
import {
  mergeData,
  getSyncMetadata,
  updateSyncCheckpoint,
  clearUserSyncData,
  CLERK_DATA_VERSION,
  filterTasksForClerk,
} from '@/lib/sync'

// Debounce delay for syncing after state changes (ms)
const SYNC_DEBOUNCE_MS = 2000

/**
 * Hook for syncing app state with Clerk unsafeMetadata
 *
 * Usage:
 * const { syncStatus, triggerSync } = useSync(persistedState, setPersisted)
 */
export function useSync(
  persistedState: PersistedState,
  setPersisted: React.Dispatch<React.SetStateAction<PersistedState>>
) {
  const { user, isSignedIn, isLoaded: isClerkLoaded } = useUser()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)

  // Refs for debouncing and tracking
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)
  const hasInitialSyncedRef = useRef(false)

  /**
   * Perform the actual sync to Clerk
   */
  const performSync = useCallback(async (
    state: PersistedState,
    isInitialSync: boolean = false
  ): Promise<boolean> => {
    if (!user || isSyncingRef.current) return false

    isSyncingRef.current = true
    setSyncStatus('syncing')
    setLastSyncError(null)

    try {
      const syncMetadata = getSyncMetadata()

      // Get current clerk data
      const clerkData = user.unsafeMetadata as ClerkUserData | null

      if (isInitialSync) {
        // Initial sync on login - merge data
        const mergeResult = mergeData(
          clerkData,
          state.stats,
          state.tasks,
          state.settings,
          state.goals,
          state.achievements,
          syncMetadata
        )

        // Update Clerk
        await user.update({
          unsafeMetadata: mergeResult.data,
        })

        // Update local state with merged data
        // Use localTasks (all tasks) not data.tasks (filtered for Clerk)
        setPersisted(prev => ({
          ...prev,
          stats: mergeResult.data.stats,
          tasks: mergeResult.localTasks,
          settings: mergeResult.data.settings,
          goals: mergeResult.data.goals,
          achievements: mergeResult.data.achievements,
        }))

        // Save sync checkpoint
        updateSyncCheckpoint(user.id, mergeResult.data.stats)
      } else {
        // Regular sync - just update Clerk with current state
        const clerkPayload: ClerkUserData = {
          version: CLERK_DATA_VERSION,
          stats: state.stats,
          tasks: filterTasksForClerk(state.tasks),
          settings: state.settings,
          goals: state.goals,
          achievements: state.achievements,
          lastSyncedAt: new Date().toISOString(),
        }

        await user.update({
          unsafeMetadata: clerkPayload,
        })

        // Update sync checkpoint
        updateSyncCheckpoint(user.id, state.stats)
      }

      setSyncStatus('synced')
      return true
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
      setLastSyncError(error instanceof Error ? error.message : 'Sync failed')
      return false
    } finally {
      isSyncingRef.current = false
    }
  }, [user, setPersisted])

  /**
   * Initial sync when user signs in
   */
  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn || !user || hasInitialSyncedRef.current) {
      return
    }

    // Perform initial sync
    hasInitialSyncedRef.current = true
    performSync(persistedState, true)
  }, [isClerkLoaded, isSignedIn, user, persistedState, performSync])

  /**
   * Debounced sync on state changes (when signed in)
   */
  useEffect(() => {
    if (!isSignedIn || !user || !hasInitialSyncedRef.current) {
      return
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    // Set new debounced sync
    syncTimeoutRef.current = setTimeout(() => {
      performSync(persistedState, false)
    }, SYNC_DEBOUNCE_MS)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [persistedState, isSignedIn, user, performSync])

  /**
   * Handle sign out - clear user sync data
   */
  useEffect(() => {
    if (isClerkLoaded && !isSignedIn && hasInitialSyncedRef.current) {
      // User signed out
      clearUserSyncData()
      hasInitialSyncedRef.current = false
      setSyncStatus('idle')
    }
  }, [isClerkLoaded, isSignedIn])

  /**
   * Manual sync trigger
   */
  const triggerSync = useCallback(() => {
    if (isSignedIn && user) {
      return performSync(persistedState, false)
    }
    return Promise.resolve(false)
  }, [isSignedIn, user, persistedState, performSync])

  return {
    syncStatus,
    lastSyncError,
    triggerSync,
    isSignedIn,
    isClerkLoaded,
  }
}
