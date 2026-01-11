"use client"

import { SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { User, Loader2, Cloud, CloudOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SyncStatus } from "@/lib/sync"

interface AuthButtonProps {
  syncStatus?: SyncStatus
}

export function AuthButton({ syncStatus = 'idle' }: AuthButtonProps) {
  const { isSignedIn, isLoaded } = useUser()

  // Loading state
  if (!isLoaded) {
    return (
      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 px-2.5 sm:px-3" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    )
  }

  // Signed in - show user button with sync status
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-1">
        {/* Sync status indicator */}
        <div className="hidden sm:flex items-center" title={`Sync: ${syncStatus}`}>
          {syncStatus === 'syncing' && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {syncStatus === 'synced' && (
            <Cloud className="h-3 w-3 text-green-500" />
          )}
          {syncStatus === 'error' && (
            <CloudOff className="h-3 w-3 text-destructive" />
          )}
          {syncStatus === 'offline' && (
            <CloudOff className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
              userButtonTrigger: "focus:shadow-none",
            },
          }}
        />
      </div>
    )
  }

  // Not signed in - show sign in button
  return (
    <SignInButton mode="modal">
      <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 px-2.5 sm:px-3">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    </SignInButton>
  )
}
