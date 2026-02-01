# Agent Build Instructions

> Project-specific instructions for **CodeFocus** - Modern Pomodoro Timer Web App.
> **CRITICAL: Read this ENTIRE file before starting any story.**

## Project Overview

CodeFocus is a modern web-based Pomodoro Timer application built with:
- **Next.js 16.0.7** with App Router
- **React 19.2.0**
- **TypeScript 5.x** with strict mode
- **Tailwind CSS 4.1** + **shadcn/ui** (Radix UI primitives)
- **Vitest** for testing
- **7-language i18n** support

**Live Site**: codefocus.io

## Project Structure

```
/home/viktor/projects/Pomo/Pomo/pomo/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (fonts, providers, metadata)
│   ├── [locale]/                # Locale-based routing (i18n)
│   │   ├── page.tsx             # Main Pomodoro timer page (757 lines)
│   │   ├── layout.tsx           # Locale-specific layout
│   │   ├── articles/            # Blog system (MDX)
│   │   ├── premium/             # Premium features page
│   │   └── signin/              # Authentication page
│   └── globals.css              # Global Tailwind styles
│
├── components/                   # React components (25+ files)
│   ├── ui/                      # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ... (10+ components)
│   ├── task-list.tsx            # Task management
│   ├── settings-dialog.tsx      # Timer/goal settings
│   ├── report-dialog.tsx        # Stats report
│   ├── streak-heatmap.tsx       # GitHub-style heatmap
│   ├── achievements-dialog.tsx  # Achievement showcase
│   └── ... (15+ feature components)
│
├── hooks/                        # Custom React hooks
│   ├── use-app-state.ts         # Main unified state management
│   ├── use-translations.ts      # i18n hook for client components
│   ├── use-celebration.ts       # Celebration effects (confetti, sounds)
│   ├── use-sound.ts             # Sound effects management
│   ├── use-confetti.ts          # Confetti animation hook
│   └── use-onboarding.ts        # Product tour/onboarding
│
├── lib/                          # Utility functions & types
│   ├── types.ts                 # All TypeScript types & interfaces
│   ├── storage.ts               # localStorage persistence layer
│   ├── stats.ts                 # Pure stat calculation functions
│   ├── achievements.ts          # Achievement system logic
│   ├── analytics.ts             # Analytics tracking wrapper
│   ├── translations.ts          # Server-side i18n helper
│   ├── articles.ts              # Article loading utilities
│   └── utils.ts                 # General utilities (cn function)
│
├── content/articles/            # MDX blog posts (multi-language)
│   ├── en/, es/, de/, fr/, pt/, ja/, zh/
│
├── messages/                     # i18n translation files
│   ├── en.json, es.json, de.json, fr.json, pt.json, ja.json, zh.json
│
├── public/                       # Static assets
│   ├── sounds/                  # Audio files
│   ├── ghosts/                  # Ghost mascot images
│   └── images/articles/         # Blog images
│
├── __tests__/                    # Test files (Vitest)
│   ├── lib/stats.test.ts
│   ├── lib/storage.test.ts
│   ├── lib/achievements.test.ts
│   └── hooks/use-app-state.test.tsx
│
├── ralph/                        # Ralph configuration (this folder)
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.mts
└── middleware.ts                 # i18n routing middleware
```

## Commands

### Build & TypeCheck
```bash
# TypeScript check (PRIMARY - run after every code change)
cd /home/viktor/projects/Pomo/Pomo/pomo && npx tsc --noEmit

# Build production (full verification)
cd /home/viktor/projects/Pomo/Pomo/pomo && npm run build
```

### Testing
```bash
# Run tests (CI mode - run once)
cd /home/viktor/projects/Pomo/Pomo/pomo && npm run test:run

# Run tests with coverage
cd /home/viktor/projects/Pomo/Pomo/pomo && npm run test:coverage
```

### Linting
```bash
cd /home/viktor/projects/Pomo/Pomo/pomo && npm run lint
```

### Development Server
```bash
cd /home/viktor/projects/Pomo/Pomo/pomo && npm run dev
```

### Install Dependencies (if needed)
```bash
cd /home/viktor/projects/Pomo/Pomo/pomo && npm install
```

## Key Files Reference

| Purpose | File |
|---------|------|
| Root layout & metadata | `app/layout.tsx` |
| Main timer page | `app/[locale]/page.tsx` |
| Unified state management | `hooks/use-app-state.ts` |
| LocalStorage persistence | `lib/storage.ts` |
| Stat calculations | `lib/stats.ts` |
| TypeScript types | `lib/types.ts` |
| Achievement logic | `lib/achievements.ts` |
| i18n middleware | `middleware.ts` |
| i18n config | `i18nConfig.ts` |

## Architecture

### State Management
- **Single hook**: `useAppState()` provides all app state and actions
- **Persisted state** (localStorage): stats, tasks, settings, goals, achievements
- **Session state** (memory): timer, activeTask, sessionPomodoros
- **Synchronous saves**: Timer state saves inside setState updaters

### Timer Logic
- 25-min focus, 5-min short break, 15-min long break (customizable)
- Auto-transitions between modes
- Long break every 4th break

### i18n
- 7 languages: en, es, de, fr, pt, ja, zh
- Dynamic routes: `/[locale]/`
- Server: `getTranslations(locale)` function
- Client: `useTranslations()` hook
- JSON files in `messages/`

### UI Components
- shadcn/ui with Radix UI primitives
- Tailwind CSS v4 for styling
- Dark/light mode via next-themes

## Business Rules

1. **Pomodoro durations** - Max 180 minutes (validated)
2. **Streaks** - Daily streak tracking with personal records
3. **Achievements** - 20+ unlockable achievements
4. **Gamification** - XP system, 4-tier leveling
5. **Tasks** - Estimate pomodoros per task, track completion

## Safety Rules

1. **ALWAYS run TypeScript check after code changes**
2. **ALWAYS run tests after modifying lib/ or hooks/**
3. **NEVER delete existing code without explicit instruction**
4. **Preserve existing functionality when adding features**
5. **NEVER run git commit - user will commit manually**
6. **Maintain i18n** - Add translations for new user-facing strings

## CRITICAL: Git Safety Rules

**NEVER RUN THESE COMMANDS:**
```bash
git commit    # User commits manually
git push      # User pushes manually
git reset     # Destructive - never use
git checkout  # Do not switch branches
```

**ONLY ALLOWED (read-only):**
```bash
git status    # See what changed
git diff      # See file changes
```

## Learnings Log

### Initial Setup
- Next.js App Router with file-based routing
- Main timer logic in `app/[locale]/page.tsx`
- All state managed via `useAppState()` hook
- Tests use Vitest with jsdom environment

### Key Patterns
- Components use `cn()` utility for conditional classes
- All dialogs are dynamic imports for code splitting
- Analytics events defined in `lib/mixpanel-events.ts`
- Translations accessed via `t('key.path')` pattern
