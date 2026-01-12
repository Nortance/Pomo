# CodeFocus - Pomodoro Timer App

## Project Overview
CodeFocus is a minimalist Pomodoro timer web app for developers. Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui components. Designed with a clean, monochromatic aesthetic inspired by Linear and Vercel.

**Live at**: codefocus.io (planned)

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Custom hooks with localStorage persistence
- **Theme**: next-themes (dark/light mode)
- **Charts**: @uiw/react-heat-map for streak visualization
- **i18n**: next-i18n-router (7 languages)
- **Blog**: MDX with next-mdx-remote

## Directory Structure
```
pomo/
├── app/[locale]/              # Localized routes
│   ├── page.tsx               # Main timer page
│   ├── layout.tsx             # Locale layout
│   ├── articles/              # SEO blog
│   │   ├── page.tsx           # Articles listing
│   │   └── [slug]/page.tsx    # Individual article
│   ├── premium/               # Premium features page
│   └── signin/                # Auth page (placeholder)
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── article-image.tsx      # Image with attribution
│   ├── language-switcher.tsx  # Flag-based locale picker
│   ├── task-list.tsx          # Task management
│   ├── settings-dialog.tsx
│   ├── report-dialog.tsx
│   ├── stats-card.tsx
│   ├── streak-heatmap.tsx
│   └── goal-progress.tsx
├── content/articles/          # MDX blog posts
├── hooks/
│   ├── use-app-state.ts       # Unified state management
│   └── use-translations.ts    # i18n hook
├── lib/
│   ├── articles.ts            # Article loading utilities
│   ├── translations.ts        # Server-side translations
│   ├── types.ts               # TypeScript definitions
│   ├── storage.ts             # localStorage layer
│   └── stats.ts               # Pure calculation functions
├── messages/                  # Translation JSON files
│   ├── en.json
│   ├── es.json
│   ├── de.json
│   ├── fr.json
│   ├── pt.json
│   ├── ja.json
│   └── zh.json
├── scripts/
│   ├── ai-detector.py         # AI content detection
│   └── fetch-image.ts         # Unsplash image fetcher
└── docs/
    ├── ARTICLES.md            # Blog system docs
    ├── SEO-ARTICLE-GUIDE.md   # Writing guide for AI-proof content
    ├── I18N.md                # Internationalization docs
    └── TESTING_*.md           # Test documentation
```

## Commands
```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint check
npm test                 # Run tests (232 tests)

# SEO Articles
npm run ai-check -- --file content/articles/my-article.mdx  # Check AI score (target: 90%+)
npm run fetch-image -- "search query" --name filename       # Fetch Unsplash image with attribution

# Screenshots
npm run screenshot       # Capture localhost:3000
```

## Architecture

### State Management
Single source of truth via `useAppState()` hook (see `hooks/use-app-state.ts`).

**Persisted state** (localStorage):
- `stats`: Daily stats, streaks, personal records, total focus time
- `tasks`: User tasks with pomodoro estimates
- `settings`: Timer durations, auto-start preferences
- `goals`: Daily/weekly pomodoro targets
- `achievements`: Unlocked achievements

**Session state** (memory only, saved synchronously to localStorage):
- `timer`: Current mode, running state, time left
- `sessionPomodoros`: Pomodoros in current session
- `activeTaskId`: Currently selected task

**Important**: Timer state is saved synchronously inside setState updaters (not in useEffect) to survive client-side navigation.

### Data Flow
1. Components call actions from `useAppState()`
2. Actions update state immutably AND save to localStorage synchronously
3. Persisted state syncs to localStorage via `lib/storage.ts`
4. Pure functions in `lib/stats.ts` handle calculations

### Internationalization (i18n)
- 7 languages: English, Spanish, German, French, Portuguese, Japanese, Chinese
- Routes: `/en`, `/es`, `/de`, `/fr`, `/pt`, `/ja`, `/zh`
- Client components: `useTranslations()` hook
- Server components: `getTranslations()` function
- See `docs/I18N.md` for details

### Articles/Blog System
- MDX files in `content/articles/`
- Frontmatter for metadata (title, description, date, tags, image)
- Images from Unsplash with proper attribution
- `<ArticleImage>` component for inline images with credits
- See `docs/ARTICLES.md` for full workflow

## Key Patterns

### Timer State Persistence
Timer state saves synchronously inside setState updaters to survive:
- Page refreshes (beforeunload)
- Language switches (client-side navigation)

```typescript
// Pattern: Save inside updater, not in useEffect
const setTimeLeft = useCallback((value) => {
  setSession((prev) => {
    const newSession = { ...prev, timer: { ...prev.timer, timeLeft: value } }
    syncSaveSession(newSession)  // Synchronous save
    return newSession
  })
}, [])
```

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

## SEO Articles Workflow

1. **Write article** in `content/articles/my-slug.mdx`
2. **Check AI score**: `npm run ai-check -- --file content/articles/my-slug.mdx`
3. **Target 90%+** human score (see `docs/SEO-ARTICLE-GUIDE.md`)
4. **Fetch images**: `npm run fetch-image -- "query" --name hero`
5. **Always attribute**: Use `imageAttribution` frontmatter or `<ArticleImage>` component

### Image Attribution Format
```yaml
# In frontmatter
imageAttribution:
  photographer: "John Doe"
  photographerUrl: "https://unsplash.com/@johndoe?utm_source=codefocus&utm_medium=referral"
  source: unsplash
```

```jsx
// Inline
<ArticleImage
  src="/images/articles/photo.jpg"
  alt="Description"
  photographer="John Doe"
  photographerUrl="https://unsplash.com/@johndoe"
  source="unsplash"
/>
```

## Current Features
- Pomodoro timer with Focus/Break/Rest modes
- Task management with pomodoro estimates
- Stats tracking (streaks, focus time, personal records)
- Daily/weekly pomo goals
- GitHub-style streak heatmap
- Achievements system with celebrations
- Dark/light theme
- Keyboard shortcuts
- Auto-start options
- Responsive mobile design
- 7-language internationalization
- SEO blog with MDX

## Planned Features
- User authentication (Supabase)
- Cloud sync
- Premium tier
- Browser notifications
- Spotify integration

## Notes for Claude
- Always use `useAppState()` for state - don't create new useState hooks for persisted data
- Timer state saves synchronously in updaters - don't use useEffect for critical saves
- Stats functions in `lib/stats.ts` are pure - pass dates as parameters for testability
- Check `lib/types.ts` for all type definitions
- Run `npm run build` to verify changes compile
- For i18n changes, update all 7 message files in `messages/`
- For articles, always include image attribution
- Target 90%+ AI score for SEO content
