# CodeFocus - Pomodoro Timer App

## Project Overview
CodeFocus is a minimalist Pomodoro timer web app for developers. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui components. Designed with a clean, monochromatic aesthetic inspired by Linear and Vercel.

**Live at**: codefocus.io (planned)

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Clerk (unsafeMetadata for user data sync)
- **State**: Custom hooks with localStorage persistence + Clerk cloud sync
- **Theme**: next-themes (dark/light/cute modes)
- **Charts**: @uiw/react-heat-map for streak visualization

## Directory Structure
```
pomo/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Main timer page
│   ├── layout.tsx         # Root layout with providers
│   ├── premium/           # Premium features page
│   ├── signin/            # Clerk sign-in page
│   └── signup/            # Clerk sign-up page
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── auth-button.tsx   # Clerk auth button with sync status
│   ├── task-list.tsx     # Task management
│   ├── settings-dialog.tsx
│   ├── report-dialog.tsx
│   ├── stats-card.tsx    # Stats display
│   ├── streak-heatmap.tsx
│   └── goal-progress.tsx
├── hooks/
│   ├── use-app-state.ts  # Unified state management
│   └── use-sync.ts       # Clerk data synchronization
├── lib/
│   ├── types.ts          # TypeScript definitions
│   ├── storage.ts        # localStorage layer
│   ├── stats.ts          # Pure calculation functions
│   └── sync/             # Clerk sync module
│       ├── types.ts      # Sync types & constants
│       ├── device.ts     # Device ID management
│       └── merge.ts      # Data merge algorithms
├── middleware.ts         # Clerk auth middleware
└── docs/                 # Architecture documentation
```

## Architecture

### State Management
Single source of truth via `useAppState()` hook (see `hooks/use-app-state.ts`).

**Persisted state** (localStorage):
- `stats`: Daily stats, streaks, personal records, total focus time
- `tasks`: User tasks with pomodoro estimates
- `settings`: Timer durations, auto-start preferences
- `goals`: Daily/weekly pomodoro targets

**Session state** (memory only):
- `timer`: Current mode, running state, time left
- `sessionPomodoros`: Pomodoros in current session
- `activeTaskId`: Currently selected task

### Data Flow
1. Components call actions from `useAppState()`
2. Actions update state immutably
3. Persisted state syncs to localStorage via `lib/storage.ts`
4. Pure functions in `lib/stats.ts` handle calculations
5. When signed in, `useSync()` syncs to Clerk unsafeMetadata (debounced)

### Cloud Sync (Clerk)
- **Auth**: Clerk with modal sign-in or dedicated `/signin` page
- **Storage**: User data stored in Clerk `unsafeMetadata` (8KB limit)
- **Merge Strategy**:
  - Stats: Additive (delta-based to prevent double-counting)
  - Tasks: Union by ID (only incomplete tasks synced, max 20)
  - Achievements: Union (once unlocked, stays unlocked)
  - Settings/Goals: Cloud wins (source of truth)
- **Offline-first**: localStorage always works, sync happens when signed in
- **Device tracking**: UUID per device for delta calculation

## Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Coding Standards
- TypeScript strict mode
- Functional components with hooks
- Pure functions for business logic (stats calculations)
- shadcn/ui for all UI primitives
- Tailwind for styling (no CSS files)
- Mobile-first responsive design

## Key Patterns

### Timer Logic
- `startDuration` tracks duration when timer started (for accurate progress)
- Progress ring: `1 - timeLeft / startDuration`
- Pomodoro completion records actual focused minutes
- Skip always goes to short break (no long break earned)

### Settings Sync
Timer updates when settings change ONLY if timer hasn't started (`timeLeft === startDuration`).

### Keyboard Shortcuts
- Space: Start/pause timer
- 1/2/3: Switch modes (Focus/Break/Rest)
- T: Add task
- R: Report dialog
- S: Settings
- ?: Shortcuts help

## Current Features
- Pomodoro timer with Focus/Break/Rest modes
- Task management with pomodoro estimates
- Stats tracking (streaks, focus time, personal records)
- Daily/weekly pomo goals
- GitHub-style streak heatmap
- Dark/light theme
- Keyboard shortcuts
- Auto-start options
- Responsive mobile design

## Planned Features
- Premium tier
- Browser notifications
- Spotify integration
- Team/organization features

## Project History
1. Initial setup with Next.js + shadcn/ui
2. Timer with mode switching
3. Task list with CRUD
4. Settings persistence
5. **Current**: Unified state architecture refactor
   - Centralized `useAppState()` hook
   - Pure stats calculations
   - Streak heatmap
   - Goal tracking

## Notes for Claude
- Always use `useAppState()` for state - don't create new useState hooks for persisted data
- Stats functions in `lib/stats.ts` are pure - pass dates as parameters for testability
- Check `lib/types.ts` for all type definitions
- Sync logic is in `lib/sync/` - merge functions handle all edge cases
- Clerk env vars required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Run `npm run build` to verify changes compile

## Environment Variables
```bash
# Required for Clerk auth (get from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```
