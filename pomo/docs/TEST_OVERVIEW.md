# Test Overview

Quick reference of all tests in the CodeFocus Pomodoro app.

## Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| `__tests__/setup.test.tsx` | 5 | Done |
| `__tests__/lib/stats.test.ts` | 71 | Done |
| `__tests__/lib/achievements.test.ts` | 73 | Done |
| `__tests__/lib/storage.test.ts` | 30 | Done |
| `__tests__/hooks/use-app-state.test.tsx` | 53 | Done |
| **Total** | **232** | **100%** |

---

## lib/stats.ts

Core calculation functions for streaks, levels, goals, and statistics.

| Function | What We Test | Reason | Status |
|----------|--------------|--------|--------|
| `calculateStreak` | Consecutive day counting from today/yesterday | Core gamification - streak display | Done |
| `calculateStreak` | Empty stats returns 0 | Edge case - new user | Done |
| `calculateStreak` | Gap in days breaks streak | Streak logic correctness | Done |
| `calculateLevel` | Tier boundaries (0, 25, 100, 500 hours) | Level progression accuracy | Done |
| `calculateLevel` | Progress percentage within tier | Progress bar correctness | Done |
| `calculateFocusScore` | Score from completion rate | Daily metric accuracy | Done |
| `calculateFocusScore` | Streak bonuses (+5 at 3, +5 at 7) | Bonus calculation | Done |
| `calculateFocusScore` | Score capped at 100 | Prevent overflow | Done |
| `calculateGoalProgress` | Daily goal percentage | Goal tracking | Done |
| `calculateGoalProgress` | Weekly goal with week boundaries | Week calculation | Done |
| `calculateGoalProgress` | Null goals handled | Optional goals | Done |
| `calculatePersonalRecords` | Most productive day found | Record tracking | Done |
| `calculatePersonalRecords` | Most productive week found | Week aggregation | Done |
| `generateHeatmapData` | 181 days of data generated | Heatmap display | Done |
| `generateHeatmapData` | Activity levels (0-4) mapped correctly | Visual intensity | Done |
| `addCompletedPomodoro` | New day entry created | First pomodoro of day | Done |
| `addCompletedPomodoro` | Existing day updated | Additional pomodoros | Done |
| `addCompletedPomodoro` | Streak recalculated | Streak updates | Done |
| `addCompletedPomodoro` | Personal records updated | Record breaking | Done |
| `addSkippedPomodoro` | Skip count incremented | Skip tracking | Done |
| `getTodayStats` | Returns existing stats | Data lookup | Done |
| `getTodayStats` | Returns default for new day | Fallback | Done |
| `formatTotalTime` | Hours and minutes formatted | Display formatting | Done |

---

## lib/achievements.ts

Achievement unlock conditions and management.

| Function | What We Test | Reason | Status |
|----------|--------------|--------|--------|
| `checkNewAchievements` | Returns newly unlocked achievements | Core unlock logic | Done |
| `checkNewAchievements` | Excludes already unlocked | Prevents duplicates | Done |
| `checkNewAchievements` | Context passed for special achievements | Time-based unlocks | Done |
| **Milestone Achievements** | | | |
| `first-focus` | Unlocks at 1 pomodoro | First achievement | Done |
| `getting-started` | Unlocks at 10 pomodoros | Early milestone | Done |
| `half-century` | Unlocks at 50 pomodoros | Mid milestone | Done |
| `centurion` | Unlocks at 100 pomodoros | Major milestone | Done |
| `focus-legend` | Unlocks at 500 pomodoros | Legendary status | Done |
| **Streak Achievements** | | | |
| `streak-starter` | Unlocks at 3-day streak | Streak beginning | Done |
| `streak-starter` | Works with longestStreak too | Historical streak | Done |
| `week-warrior` | Unlocks at 7-day streak | Week streak | Done |
| `month-master` | Unlocks at 30-day streak | Month streak | Done |
| `dedicated` | Unlocks at 7 unique days | Consistency | Done |
| **Level Achievements** | | | |
| `level-apprentice` | Unlocks immediately (0 hours) | Starting tier | Done |
| `level-craftsman` | Unlocks at 25 hours | Second tier | Done |
| `level-master` | Unlocks at 100 hours | Third tier | Done |
| `level-grandmaster` | Unlocks at 500 hours | Final tier | Done |
| **Special Achievements** | | | |
| `early-bird` | Unlocks 5-7 AM completion | Morning user | Done |
| `night-owl` | Unlocks 10 PM - 2 AM completion | Night user | Done |
| `marathon` | Unlocks at 5 session pomodoros | Long session | Done |
| `perfect-day` | Unlocks at 8 daily pomodoros | Productive day | Done |
| `productive-week` | Unlocks at 25 weekly pomodoros | Productive week | Done |
| `speed-demon` | Unlocks at 3 session pomodoros | Quick session | Done |
| `getAllAchievements` | Returns all with unlock status | UI display | Done |
| `getUnlockedCount` | Returns count / total | Progress display | Done |

---

## lib/storage.ts

LocalStorage persistence and data migration.

| Function | What We Test | Reason | Status |
|----------|--------------|--------|--------|
| `loadState` | Returns default state when empty | New user | Done |
| `loadState` | Merges partial data with defaults | Backwards compat | Done |
| `loadState` | Handles corrupted JSON | Error recovery | Done |
| `loadState` | Migrates from legacy format | Old user upgrade | Done |
| `saveState` | Writes valid JSON to localStorage | Persistence | Done |
| `saveState` | Handles server-side render (no window) | SSR safety | Done |
| `clearState` | Removes both current and legacy keys | Clean reset | Done |
| `migrateFromLegacy` | Converts old stats format | Migration | Done |
| `migrateFromLegacy` | Returns null if no legacy data | No-op | Done |
| `mergeStats` | Deep merges nested objects | Default filling | Done |
| `mergeStats` | Preserves existing values | No overwrite | Done |

---

## hooks/use-app-state.ts

Central state management hook.

| Function | What We Test | Reason | Status |
|----------|--------------|--------|--------|
| **Task Management** | | | |
| `addTask` | Creates task with ID and defaults | Task creation | Done |
| `updateTask` | Updates task properties | Task editing | Done |
| `deleteTask` | Removes task from list | Task deletion | Done |
| `setActiveTask` | Sets/clears active task | Task selection | Done |
| `completeTaskPomodoro` | Increments task pomodoro count | Progress tracking | Done |
| **Settings** | | | |
| `updateSettings` | Merges new settings | Settings change | Done |
| `updateGoals` | Sets daily/weekly goals | Goal setting | Done |
| **Timer** | | | |
| `setTimerMode` | Changes mode and resets time | Mode switching | Done |
| `setTimerRunning` | Starts/stops timer | Timer control | Done |
| `setTimeLeft` | Updates remaining time | Countdown | Done |
| **Stats** | | | |
| `recordPomodoro` | Updates stats via addCompletedPomodoro | Completion | Done |
| `recordSkippedPomodoro` | Updates stats via addSkippedPomodoro | Skip | Done |
| **Achievements** | | | |
| `unlockAchievement` | Adds to unlocked list | Achievement unlock | Done |
| `unlockAchievement` | Prevents duplicate unlocks | Dedup | Done |
| **Computed Values** | | | |
| `todayStats` | Derives from dailyStats | Today's data | Done |
| `level` | Derives from totalFocusMinutes | Level calc | Done |
| `goalProgress` | Derives from stats + goals | Progress calc | Done |

---

## Not Tested (Intentionally)

| File | Reason | Alternative |
|------|--------|-------------|
| `app/page.tsx` | Complex timer with setInterval | E2E tests (Playwright) |
| `hooks/use-celebration.ts` | Side-effect heavy (confetti, sound) | Mock in integration |
| `hooks/use-confetti.ts` | JS-Confetti library wrapper | Library tested |
| `hooks/use-sound.ts` | Audio API wrapper | Browser testing |
| UI components (`components/*`) | Presentational only | Visual regression |

---

## Running Tests

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```
