# CodeFocus Gamification Plan

## Overview

Transform CodeFocus from a timer tool into an engaging productivity game using the Ghost mascot theme. Focus on celebration moments, XP progression, and achievement badges.

---

## Tech Stack Decisions

### Confetti: js-confetti (Ghost Emoji)
- **Library**: [js-confetti](https://github.com/loonywizard/js-confetti) - Zero dependencies, TypeScript support
- **Why**: Native emoji support including 👻 ghost emoji
- **Install**: `npm install js-confetti`
- **Usage**:
  ```tsx
  const jsConfetti = new JSConfetti()
  jsConfetti.addConfetti({
    emojis: ['👻', '✨', '🎉'],
    emojiSize: 50,
    confettiNumber: 30,
  })
  ```
- **Triggers**: Level-up, achievement unlock, streak milestones

### Icons: Ghost Character Set
**Option A - IconScout (Recommended)**
- [IconScout Cute Ghost Packs](https://iconscout.com/icon-packs/cute-ghost) - 2,084+ variations
- Includes expressions: happy, sad, angry, sleeping, excited, etc.
- Available in SVG, PNG - works with Figma, React
- Some free packs available, premium for full set

**Option B - Freepik Free Ghosts**
- [Freepik Ghost Emoji Vectors](https://www.freepik.com/vectors/ghost-emoji) - Free with attribution
- Many expressions and poses available
- Download as SVG, customize in Figma

**Option C - Custom SVGs (Fallback)**
- Use Lucide `Ghost` as base
- Create 10-15 variations in Figma with accessories:
  - 🔥 Fire aura (streak badges)
  - 👑 Crown (master level)
  - 📚 Book (study theme)
  - ☀️ Sun rays (early bird)
  - 🌙 Moon (night owl)
  - ⚡ Lightning (speed badges)

### Sounds: Native Audio API + Dev_Tones
- **Library**: Use native `Audio` API (no dependency needed)
- **Source**: [Dev_Tones](https://rcptones.com/dev_tones/) - Free UI sounds for apps
- **Sounds needed**:
  - `complete.mp3` - Pomodoro completion (satisfying ding)
  - `levelup.mp3` - Level up celebration
  - `achievement.mp3` - Badge unlock
  - `streak.mp3` - Streak milestone (optional)

### Toasts: Sonner (shadcn/ui)
- Already compatible with our stack
- Install: `npx shadcn@latest add sonner`
- Custom styling via CSS variables
- Supports custom icons (our ghost!)

---

## Implementation Plan

### Phase 1: XP Rebranding (Quick Win)
**Effort: Small | Impact: Medium**

1. Rename `totalFocusMinutes` display to "XP (min)" in UI
2. Update StatsCard: Replace "Score" with "XP" display
3. Remove `calculateFocusScore()` from stats.ts
4. Update stats-card.tsx to show XP prominently

**Files to modify:**
- `components/stats-card.tsx`
- `lib/stats.ts` (remove focusScore)
- `hooks/use-app-state.ts` (remove focusScore from computed)

---

### Phase 2: Celebration System (Critical)
**Effort: Medium | Impact: High**

#### 2a. Toast Notifications
1. Install Sonner: `npx shadcn@latest add sonner`
2. Add `<Toaster />` to layout.tsx
3. Create celebration toast on pomodoro completion:
   ```tsx
   toast.success(`+${duration} XP`, {
     description: "Pomodoro complete!",
     icon: <Ghost className="h-4 w-4" />
   })
   ```

#### 2b. Ghost Confetti
1. Install js-confetti: `npm install js-confetti`
2. Create confetti hook:
   ```tsx
   // hooks/use-confetti.ts
   import JSConfetti from 'js-confetti'

   const jsConfetti = new JSConfetti()

   export function useConfetti() {
     const ghostConfetti = () => {
       jsConfetti.addConfetti({
         emojis: ['👻'],
         emojiSize: 60,
         confettiNumber: 20,
       })
     }

     const celebrationConfetti = () => {
       jsConfetti.addConfetti({
         emojis: ['👻', '✨', '🎉', '⭐'],
         emojiSize: 40,
         confettiNumber: 50,
       })
     }

     return { ghostConfetti, celebrationConfetti }
   }
   ```
3. Trigger on: level-up, achievement unlock, streak milestones

#### 2c. Sound Effects
1. Download sounds from Dev_Tones
2. Add sound playback utility
3. Respect user mute preference (add to settings)

**Files to create/modify:**
- `app/layout.tsx` (add Toaster)
- `hooks/use-confetti.ts` (new - confetti utility)
- `lib/sounds.ts` (new - sound utility)
- `hooks/use-app-state.ts` (trigger celebrations)

---

### Phase 3: Level Progress Bar (Critical)
**Effort: Small | Impact: High**

1. Add visual progress bar to StatsCard level section
2. Show "847 / 1,500 XP to Master" text
3. Animate progress bar fill

**Current level thresholds (in hours → convert to XP/minutes):**
- Apprentice: 0 - 1,499 XP (0-24h)
- Craftsman: 1,500 - 5,999 XP (25-99h)
- Master: 6,000 - 29,999 XP (100-499h)
- Grandmaster: 30,000+ XP (500h+)

**Consider adding sub-levels for faster progression feel:**
- Apprentice I, II, III (500 XP each)
- Craftsman I, II, III (1,500 XP each)
- etc.

**Files to modify:**
- `components/stats-card.tsx`
- `lib/stats.ts` (update calculateLevel for sub-levels)

---

### Phase 4: Achievement System (Critical)
**Effort: Large | Impact: High**

#### Achievement Types

**Milestone Badges:**
| Badge | Requirement | Ghost Variant |
|-------|-------------|---------------|
| First Focus | Complete 1 pomodoro | Baby ghost |
| Century | 100 total pomodoros | Ghost with "100" |
| Deep Worker | 1,000 XP in one day | Focused ghost |
| Thousand Club | 1,000 total pomodoros | Party ghost |

**Streak Badges:**
| Badge | Requirement | Ghost Variant |
|-------|-------------|---------------|
| Getting Started | 3-day streak | Ghost with spark |
| Week Warrior | 7-day streak | Ghost with fire |
| Monthly Master | 30-day streak | Ghost with crown |
| Unstoppable | 100-day streak | Legendary ghost |

**Time-based Badges:**
| Badge | Requirement | Ghost Variant |
|-------|-------------|---------------|
| Early Bird | Pomodoro before 7am | Ghost with sun |
| Night Owl | Pomodoro after 10pm | Ghost with moon |
| Weekend Warrior | Pomodoro on Sat/Sun | Ghost relaxing |

**Session Badges:**
| Badge | Requirement | Ghost Variant |
|-------|-------------|---------------|
| Marathon | 8+ pomodoros in one day | Running ghost |
| Perfect Day | Hit daily goal | Ghost with checkmark |
| Perfect Week | Hit weekly goal | Ghost with trophy |

#### Data Structure

```typescript
// lib/types.ts
interface Achievement {
  id: string
  name: string
  description: string
  icon: 'ghost-baby' | 'ghost-fire' | 'ghost-crown' | ...
  unlockedAt: string | null  // ISO date or null if locked
  requirement: {
    type: 'pomodoros' | 'streak' | 'xp' | 'time' | 'daily'
    value: number
    condition?: 'before' | 'after' | 'weekend'  // for time-based
  }
}

// Add to Stats
interface Stats {
  // ... existing
  achievements: Achievement[]
}
```

**Files to create/modify:**
- `lib/types.ts` (Achievement interface)
- `lib/achievements.ts` (new - achievement definitions + check logic)
- `lib/storage.ts` (migration for achievements)
- `components/achievement-toast.tsx` (new - custom unlock toast)
- `components/achievements-dialog.tsx` (new - view all badges)
- `hooks/use-app-state.ts` (check achievements on state changes)

---

### Phase 5: Level-Up Celebration (Medium Impact)
**Effort: Medium | Impact: Medium**

1. Detect when user crosses level threshold
2. Show special full-screen or modal celebration
3. Play level-up sound
4. Display new ghost variant

**Files to create/modify:**
- `components/level-up-modal.tsx` (new)
- `hooks/use-app-state.ts` (detect level change)

---

### Phase 6: Streak Protection (Premium Feature)
**Effort: Medium | Impact: Medium**

1. Add "Streak Freeze" item (1 free per week, more via premium)
2. Show streak danger warning at 10pm if no pomodoros
3. Allow using freeze to maintain streak

**Files to create/modify:**
- `lib/types.ts` (add streakFreezes to state)
- `components/streak-warning.tsx` (new)
- Settings or premium page integration

---

## File Structure After Implementation

```
lib/
├── types.ts          # + Achievement interface
├── stats.ts          # - focusScore, + sub-levels
├── achievements.ts   # NEW: achievement definitions & logic
├── sounds.ts         # NEW: sound playback utility
└── storage.ts        # + achievements migration

components/
├── stats-card.tsx           # XP display, level progress bar
├── achievement-toast.tsx    # NEW: unlock celebration
├── achievements-dialog.tsx  # NEW: badge collection view
├── level-up-modal.tsx       # NEW: level celebration
└── ui/
    └── sonner.tsx           # NEW: from shadcn

hooks/
├── use-app-state.ts  # + toast triggers, achievement checks
└── use-confetti.ts   # NEW: ghost emoji confetti

public/
├── sounds/
│   ├── complete.mp3
│   ├── levelup.mp3
│   └── achievement.mp3
└── ghosts/           # Ghost SVG variations (if custom)
    ├── ghost-happy.svg
    ├── ghost-fire.svg
    ├── ghost-crown.svg
    └── ...
```

---

## Design Guidelines

### Visual Style
- Maintain minimalist monochrome aesthetic
- Ghost icons: Simple line art, not filled
- Celebrations: Subtle, not overwhelming
- Progress bars: Thin (h-1.5), match existing border style

### Sound Design
- Keep sounds short (< 1 second for completion)
- Subtle, not jarring
- Respect system mute/volume
- Add setting to disable sounds

### Animation
- Use CSS transitions (300ms default)
- Subtle scale on achievement unlock
- Progress bar: smooth fill animation
- No flashy/distracting animations

---

## Priority Order

1. **Phase 1**: XP Rebranding (30 min)
2. **Phase 2**: Celebration Toasts (1-2 hours)
3. **Phase 3**: Level Progress Bar (1 hour)
4. **Phase 4**: Achievement System (4-6 hours)
5. **Phase 5**: Level-Up Celebration (2 hours)
6. **Phase 6**: Streak Protection (premium, later)

**Total estimated effort: 8-12 hours**

---

## Success Metrics

- [ ] Every pomodoro completion shows XP toast
- [ ] Level progress visible at all times
- [ ] 10+ achievements defined and trackable
- [ ] Sound plays on completion (with mute option)
- [ ] Users can view all badges (locked + unlocked)

---

## Sources

### Libraries
- [Sonner - shadcn/ui](https://ui.shadcn.com/docs/components/sonner) - Toast notifications
- [js-confetti](https://github.com/loonywizard/js-confetti) - Emoji confetti (zero deps)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) - Custom shape confetti (alternative)
- [Lucide Ghost Icon](https://lucide.dev/icons/ghost) - Base ghost icon
- [Dev_Tones](https://rcptones.com/dev_tones/) - Free UI sounds

### Ghost Icon Resources
- [IconScout Cute Ghost Packs](https://iconscout.com/icon-packs/cute-ghost) - 2,084+ ghost variations
- [Freepik Ghost Vectors](https://www.freepik.com/vectors/ghost-emoji) - Free with attribution
- [FreeSVG.org](https://freesvg.org/) - Public domain SVGs
- [Caluya Design Free Ghosts](https://store.caluyadesign.com/products/free-ghost-halloween-svg-kawaii-ghost-svg) - Free SVGs

### Research
- [Duolingo Gamification Study](https://strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo/)
- [SaaS Gamification Techniques](https://cieden.com/top-gamification-techniques-for-saas)
- [Psychology of Gamification](https://www.smartico.ai/blog-post/the-psychology-of-gamification-and-why-it-works)
