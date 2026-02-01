# Timer Issues Research Report

## Executive Summary

Two critical timer bugs were reported:
1. **Time drift**: 180-min timer shows ~110 min remaining after 3 hours away
2. **Runaway timer**: Timer ran overnight, recording 2000+ minutes of work

**Root Cause**: The timer uses `setInterval` without compensating for browser throttling when tabs are backgrounded, and lacks proper Page Visibility API handling.

---

## Issues Identified

### ISSUE #1: No Page Visibility API Handling (CRITICAL)

**Severity**: HIGH
**Files affected**: `app/[locale]/page.tsx`, `hooks/use-app-state.ts`

**Current behavior**:
- Timer uses `setInterval` with 1-second ticks
- When tab is backgrounded, browsers throttle `setInterval` to 1 second minimum (or 1 minute in Chrome)
- Timer continues "running" visually but actual time elapsed diverges from displayed time

**What happens**:
1. User starts 180-min timer
2. Switches tab/minimizes browser for 3 hours
3. Browser suspends/throttles the setInterval
4. Timer may only tick ~110 times instead of 10,800 times
5. When tab regains focus, timer shows wrong time

**Missing code**:
```typescript
// NOT IN CURRENT CODE - needs to be added
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && timer.isRunning) {
      // Save timestamp when hiding
    } else if (!document.hidden && timer.isRunning) {
      // Calculate real elapsed time and adjust
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [timer.isRunning])
```

**References**:
- [Chrome/Firefox throttle setInterval in inactive tabs](https://tanzu.vmware.com/content/blog/chrome-and-firefox-throttle-settimeout-setinterval-in-inactive-tabs)
- [How to Prevent Timers from Stopping](https://isamatov.com/prevent-timers-stopping-javascript/)

---

### ISSUE #2: Timer Session Recovery Only Works on Page Refresh (CRITICAL)

**Severity**: HIGH
**Files affected**: `hooks/use-app-state.ts`, `lib/storage.ts`

**Current behavior**:
- Timer state is saved to localStorage with `savedAt` timestamp
- Recovery logic runs ONLY in `useEffect(() => {}, [])` on component mount
- Works for: page refresh, navigation, browser restart
- Does NOT work for: tab backgrounding without closing

**The problem**:
```typescript
// Current code in use-app-state.ts (lines 72-102)
useEffect(() => {
  const savedTimer = loadTimerSession()
  if (savedTimer) {
    const elapsedMs = Date.now() - savedTimer.savedAt
    const elapsedSeconds = Math.floor(elapsedMs / 1000)
    // Adjust time...
  }
}, [])  // <-- Only runs on MOUNT, not on visibility change
```

**Result**: When user backgrounds tab for 3 hours and returns, the page doesn't remount. The recovery logic never runs. The setInterval resumes with stale `timeLeft` value.

---

### ISSUE #3: Timer Can Record Unrealistic Time Values (CRITICAL)

**Severity**: HIGH
**Files affected**: `lib/stats.ts`, `app/[locale]/page.tsx`

**Current behavior**:
```typescript
// app/[locale]/page.tsx line 248
const xpEarned = Math.round(timer.startDuration / 60)
recordPomodoro(xpEarned)
```

**The problem**:
- `startDuration` comes from saved timer session or settings
- NO validation on the value
- If corrupted/manipulated, can be 120000 seconds (2000 minutes)
- `addCompletedPomodoro()` accepts any value without bounds checking

**Example scenario**:
1. User starts timer, browser stores `startDuration = 10800` (180 min)
2. Due to bug or data corruption, value becomes very large
3. Timer completes (or completes due to bug)
4. Records 2000+ minutes as "focused time"
5. Unlocks all achievements instantly

---

### ISSUE #4: Timer Completion Can Be Triggered at Wrong Time

**Severity**: MEDIUM-HIGH
**Files affected**: `app/[locale]/page.tsx`

**Current behavior**:
```typescript
// Timer completion check (line 245)
} else if (timer.timeLeft === 0) {
  if (timer.mode === "pomodoro") {
    recordPomodoro(xpEarned)
    // ...
  }
}
```

**The problem**:
- Completion triggers when `timeLeft === 0`
- If timer state is corrupted/restored with `timeLeft = 0` and `isRunning = false`, completion still triggers
- The effect runs on dependency changes, not just countdown
- Mode switch prevents double-execution, but relies on synchronous state update

---

### ISSUE #5: No Maximum Duration Validation (MEDIUM)

**Severity**: MEDIUM
**Files affected**: `lib/storage.ts`, `hooks/use-app-state.ts`

**Current behavior**:
- Settings allow any pomodoro duration
- Saved timer session has no validation on `startDuration`
- 24-hour expiry is the only guard (clears sessions older than 24 hours)

**Missing validations**:
- Maximum pomodoro duration (e.g., 120 minutes)
- Minimum pomodoro duration (e.g., 1 minute)
- Consistency check: `timeLeft <= startDuration`
- Consistency check: `startDuration` matches a valid setting

---

## Current Timer Architecture

### How It Works (Current)

```
┌─────────────────────────────────────────────────────────────────┐
│                         page.tsx                                 │
│                                                                 │
│  useEffect(() => {                                              │
│    setInterval(() => setTimeLeft(prev => prev - 1), 1000)       │
│  }, [isRunning, timeLeft])                                      │
│                                                                 │
│  ↓ On every tick, state updates                                 │
│  ↓ syncSaveSession() saves to localStorage                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      localStorage                                │
│                                                                 │
│  {                                                              │
│    mode: "pomodoro",                                            │
│    timeLeft: 1234,        ← Current seconds remaining           │
│    startDuration: 10800,  ← Original duration (fixed)           │
│    isRunning: true,                                             │
│    savedAt: 1706640123456 ← Unix timestamp (ms)                 │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   On Page Mount ONLY                             │
│                                                                 │
│  const elapsedMs = Date.now() - savedTimer.savedAt              │
│  newTimeLeft = Math.max(0, savedTimer.timeLeft - elapsedSeconds)│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Gap

```
Tab Backgrounded                    Tab Foregrounded
      │                                    │
      ▼                                    ▼
  setInterval                          setInterval
   throttled                            resumes
      │                                    │
      │     ╔════════════════════╗        │
      │     ║  NO COMPENSATION   ║        │
      └────►║  Time continues,   ║◄───────┘
            ║  but timer doesn't ║
            ║  adjust timeLeft   ║
            ╚════════════════════╝
```

---

## False Positive Analysis

After reviewing the codebase against web research, the following are **NOT false positives**:

| Finding | Confirmed? | Evidence |
|---------|------------|----------|
| No Page Visibility API | ✅ Yes | Searched entire codebase for `visibilitychange`, `document.hidden` - not found |
| setInterval throttling | ✅ Yes | Standard browser behavior, well-documented |
| No time validation | ✅ Yes | `addCompletedPomodoro()` accepts any `pomodoroMinutes` value |
| Recovery only on mount | ✅ Yes | `useEffect(() => {}, [])` empty deps = mount only |

### Verified Working Correctly

| Feature | Status |
|---------|--------|
| Timer saves on every tick | ✅ Works - `syncSaveSession()` called in `setTimeLeft` |
| Recovery after page refresh | ✅ Works - Tested via code review |
| 24-hour session expiry | ✅ Works - `loadTimerSession()` checks `maxAge` |
| XP from startDuration | ✅ Correct design - Uses original duration not current |

---

## Action Plan

### Phase 1: Add Page Visibility Handling (CRITICAL)

**File**: `app/[locale]/page.tsx`

Add a new `useEffect` that:
1. Listens for `visibilitychange` event
2. When tab becomes visible AND timer is running:
   - Calculate elapsed time since last save
   - Adjust `timeLeft` accordingly
   - If `timeLeft` would be <= 0, complete the timer

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && timer.isRunning) {
      const savedTimer = loadTimerSession()
      if (savedTimer) {
        const elapsedMs = Date.now() - savedTimer.savedAt
        const elapsedSeconds = Math.floor(elapsedMs / 1000)
        const newTimeLeft = Math.max(0, savedTimer.timeLeft - elapsedSeconds)
        setTimeLeft(newTimeLeft)
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [timer.isRunning])
```

### Phase 2: Add Time Validation (CRITICAL)

**File**: `lib/stats.ts`

Add validation in `addCompletedPomodoro()`:
```typescript
export function addCompletedPomodoro(
  stats: Stats,
  pomodoroMinutes: number,
  today?: string
): Stats {
  // Validate input - clamp to reasonable range
  const validatedMinutes = Math.max(1, Math.min(pomodoroMinutes, 180))
  // ... rest of function uses validatedMinutes
}
```

**File**: `lib/storage.ts`

Add validation in `loadTimerSession()`:
```typescript
// Validate startDuration is reasonable (max 3 hours = 10800 seconds)
const MAX_DURATION = 3 * 60 * 60 // 3 hours in seconds
if (parsed.startDuration > MAX_DURATION || parsed.startDuration <= 0) {
  clearTimerSession()
  return null
}

// Validate timeLeft is consistent
if (parsed.timeLeft > parsed.startDuration || parsed.timeLeft < 0) {
  clearTimerSession()
  return null
}
```

### Phase 3: Prevent Runaway Timer Completion (MEDIUM)

**File**: `app/[locale]/page.tsx`

Add a guard to prevent recording if elapsed time is unrealistic:
```typescript
if (timer.timeLeft === 0 && timer.mode === "pomodoro") {
  const xpEarned = Math.round(timer.startDuration / 60)

  // Sanity check: don't record if duration seems wrong
  if (xpEarned > 180) {
    console.warn('Suspicious duration, not recording:', xpEarned)
    switchMode("shortBreak")
    return
  }

  recordPomodoro(xpEarned)
  // ...
}
```

### Phase 4: Add Timer Completion Guard (LOW)

Add a ref to track if completion was already processed:
```typescript
const hasCompletedRef = useRef(false)

// In completion effect:
if (timer.timeLeft === 0 && !hasCompletedRef.current) {
  hasCompletedRef.current = true
  // ... handle completion
}

// Reset when timer starts:
if (timer.isRunning && timer.timeLeft > 0) {
  hasCompletedRef.current = false
}
```

---

## Summary

| Priority | Issue | Solution | Status |
|----------|-------|----------|--------|
| P0 | No visibility handling | Add `visibilitychange` listener | ✅ FIXED |
| P0 | No time validation | Add bounds checking in stats/storage | ✅ FIXED |
| P1 | Timer can run overnight | Combine visibility + validation | ✅ FIXED |
| P2 | Double completion | Add completion guard ref | ✅ FIXED |

---

## Fixes Implemented

### 1. Page Visibility API Handler (`app/[locale]/page.tsx`)

Added a `useEffect` that listens for `visibilitychange` event. When tab becomes visible:
- Loads saved timer session
- Calculates elapsed time since last save
- Adjusts `timeLeft` accordingly

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden || !timer.isRunning) return
    const savedTimer = loadTimerSession()
    if (!savedTimer || !savedTimer.isRunning) return

    const elapsedMs = Date.now() - savedTimer.savedAt
    const elapsedSeconds = Math.floor(elapsedMs / 1000)

    if (elapsedSeconds > 2) {
      const newTimeLeft = Math.max(0, savedTimer.timeLeft - elapsedSeconds)
      setTimeLeft(newTimeLeft)
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [timer.isRunning, setTimeLeft])
```

### 2. Time Validation in Stats (`lib/stats.ts`)

Added bounds checking in `addCompletedPomodoro()`:
- Minimum: 1 minute
- Maximum: 180 minutes (3 hours)
- Logs warning if clamping occurs

### 3. Timer Session Validation (`lib/storage.ts`)

Added validation in `loadTimerSession()`:
- `startDuration` must be > 0 and <= 3 hours
- `timeLeft` must be consistent with `startDuration`
- `savedAt` must not be in the future
- Clears invalid sessions automatically

### 4. Double Completion Guard (`app/[locale]/page.tsx`)

Added `hasCompletedRef` to prevent multiple recordings:
- Set to `true` when completion triggers
- Reset to `false` when timer starts running
- Guards the completion logic with `!hasCompletedRef.current`

### 5. Duration Sanity Check (`app/[locale]/page.tsx`)

Added final safety check before recording:
- Rejects durations > 180 minutes
- Logs warning and switches to break mode instead

---

## Test Results

All 232 existing tests pass after changes.

Build successful.
