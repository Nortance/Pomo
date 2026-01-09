# Cute Mode Implementation Plan

## Product-Market Fit Strategy

Based on research, the winning formula is:
```
Cute Aesthetics + Emotional Mascot + Gentle Gamification + Sensory Experience = Viral Growth
```

We already have gamification (achievements, levels, XP) and a mascot (ghosts).
We need: **Cute aesthetics** + **Sensory experience** (sounds).

---

# User Stories & Acceptance Criteria

## Epic 1: Cute Theme

### Story 1.1: Add Cute Theme CSS Variables
**As a** user who loves cute/kawaii aesthetics
**I want** a pink pastel color theme
**So that** the app feels warm, friendly, and matches my style

**Acceptance Criteria:**
- [x] `.cute` class defined in `globals.css`
- [x] Background is rose white (#FFF5F5)
- [x] Primary color is pink (#C05068 - WCAG AA compliant, 4.58:1)
- [x] All text has sufficient contrast (WCAG AA verified)
  - Main text: 8.07:1 (AAA)
  - Muted text: 4.96:1 (AA)
  - Button text: 4.58:1 (AA)
- [x] Borders and muted colors use soft mauve tones (#D8C0D0)

---

### Story 1.2: Add Theme Toggle for Cute Mode
**As a** user
**I want** to switch between Light, Dark, and Cute themes
**So that** I can choose my preferred visual style

**Acceptance Criteria:**
- [x] Theme toggle shows 4 options (Light/Dark/Cute/System)
- [x] Selecting "Cute" applies pink theme immediately
- [x] Theme preference persists after refresh (via next-themes)
- [x] Toggle is accessible (keyboard navigable)

---

### Story 1.3: Ensure UI Consistency in Cute Mode
**As a** user using Cute mode
**I want** all UI elements to look cohesive
**So that** nothing looks broken or out of place

**Acceptance Criteria:**
- [x] Timer progress ring visible on pink background
- [x] Buttons have good contrast and hover states
- [x] Heatmap colors work with pink theme
- [x] Ghost icons display correctly (no dark mode invert)
- [x] All dialogs/modals styled correctly
- [x] Forms and inputs have visible borders

---

## Epic 2: Ambient Sounds

### Story 2.1: Create Ambient Sound Player Component
**As a** user who wants background sounds while focusing
**I want** to play ambient sounds (lofi, rain, etc.)
**So that** I can concentrate better and enjoy the experience

**Acceptance Criteria:**
- [x] Component displays sound selection dropdown
- [x] Options: None, Lofi, Rain, Forest, Coffee Shop
- [x] Play/pause button toggles audio
- [x] Sound loops seamlessly
- [x] Selecting "None" stops audio

---

### Story 2.2: Add Volume Control
**As a** user
**I want** to adjust ambient sound volume
**So that** I can balance it with other audio

**Acceptance Criteria:**
- [x] Volume slider (0-100%)
- [x] Volume persists in settings (localStorage)
- [x] Muting ambient doesn't affect UI sounds (separate control)

---

### Story 2.3: Integrate Ambient Player into UI
**As a** user
**I want** easy access to ambient sounds
**So that** I can quickly turn them on/off

**Acceptance Criteria:**
- [x] Ambient control visible on main page (header, next to theme toggle)
- [x] Compact design, doesn't clutter UI (icon button with dropdown)
- [x] Works on mobile
- [x] Separate from "Sound Effects" toggle in settings

---

### Story 2.4: Source Ambient Sound Files
**As a** developer
**I want** royalty-free ambient sound loops
**So that** we can use them legally

**Acceptance Criteria:**
- [x] 4 ambient tracks sourced (Lofi, Rain, Forest, Coffee Shop)
- [x] Files loop (HTML5 audio loop attribute)
- [x] Files are MP3, optimized for web
- [x] Royalty-free sources (Pixabay, SoundBible)

---

## Epic 3: Ghost Personality (Optional)

### Story 3.1: Display Ghost Mascot on Timer
**As a** user
**I want** to see my ghost companion while focusing
**So that** I feel motivated and emotionally connected

**Acceptance Criteria:**
- [ ] Ghost image displays near/below timer
- [ ] Ghost is appropriately sized (not distracting)
- [ ] Different ghost shown based on level (apprentice/craftsman/etc.)

---

### Story 3.2: Ghost Reacts to Timer State
**As a** user
**I want** my ghost to react to what I'm doing
**So that** it feels alive and encouraging

**Acceptance Criteria:**
- [ ] Focus mode: energetic ghost (e.g., ghost-lightning or ghost-fire)
- [ ] Break mode: relaxed ghost (e.g., ghost-moon or ghost-heart)
- [ ] Idle: neutral ghost (level-based)

---

### Story 3.3: Add Subtle Ghost Animation
**As a** user
**I want** the ghost to have gentle movement
**So that** it feels alive, not static

**Acceptance Criteria:**
- [ ] CSS animation: gentle float or bounce
- [ ] Animation is subtle (not distracting)
- [ ] Animation can be disabled (respects reduced-motion preference)

---

## Epic 4: Social & Shareability (Future)

### Story 4.1: Share Stats Card
**As a** user proud of my progress
**I want** to generate a shareable image of my stats
**So that** I can post it on social media

**Acceptance Criteria:**
- [ ] "Share" button generates image
- [ ] Image includes: XP, streak, level, ghost
- [ ] Image is aesthetic and on-brand
- [ ] Works on mobile (download or share sheet)

*(More stories to be added when this epic is prioritized)*

---

# Technical Specifications

## Phase 1: Cute Theme

### Color Palette

```css
.cute {
  --background: #FFF5F5;        /* Rose white */
  --foreground: #6B5B6B;        /* Soft purple-gray */
  --card: #FFFFFF;
  --card-foreground: #6B5B6B;
  --primary: #FFB6C1;           /* Light pink */
  --primary-foreground: #FFFFFF;
  --accent: #E6E6FA;            /* Lavender */
  --accent-foreground: #6B5B6B;
  --muted: #FFF0F5;             /* Lavender blush */
  --muted-foreground: #9B8B9B;
  --border: #F0E6EF;            /* Light mauve */
  --ring: #FFB6C1;
}
```

### Files to Modify

| File | Change |
|------|--------|
| `globals.css` | Add `.cute` CSS variables |
| `theme-toggle.tsx` | Add cute option |
| `theme-provider.tsx` | Register "cute" theme |

---

## Phase 2: Ambient Sounds

### Sound Sources
- [Pixabay](https://pixabay.com/music/) - Free, no attribution
- [Mixkit](https://mixkit.co/free-stock-music/) - Free ambient loops

### Files to Add/Modify

| File | Change |
|------|--------|
| `components/ambient-sounds.tsx` | NEW - Sound player component |
| `public/sounds/ambient/` | Add 4 ambient MP3 loops |
| `app/page.tsx` | Add component to UI |
| `lib/types.ts` | Add ambient settings type |
| `lib/storage.ts` | Persist ambient preferences |

---

## Phase 3: Ghost Personality

### Files to Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Add ghost display component |
| `globals.css` | Add float/bounce keyframes |

---

## Phase 4: Social (Future)

Requires more planning. Potential approaches:
- html2canvas for client-side image generation
- Server-side image generation with @vercel/og

---

## Priority Order

| Phase | Impact | Effort | Do Now? |
|-------|--------|--------|---------|
| 1. Cute Theme | HIGH | LOW | YES |
| 2. Ambient Sounds | HIGH | LOW-MED | YES |
| 3. Ghost Personality | MEDIUM | LOW | MAYBE |
| 4. Social Features | HIGH | HIGH | LATER |

---

## Testing Checklist

### Cute Theme
- [ ] All text readable on pink background
- [ ] Buttons have good contrast
- [ ] Progress ring visible
- [ ] Heatmap colors work
- [ ] Ghost icons visible (no invert needed)
- [ ] Forms and inputs styled correctly

### Ambient Sounds
- [ ] Sounds loop seamlessly
- [ ] Respects sound toggle in settings
- [ ] Doesn't conflict with completion sounds
- [ ] Works on mobile

---

## SEO Landing Page (Future)

Create `/cute` or `/aesthetic` page targeting:
- "cute pomodoro timer"
- "aesthetic study timer"
- "kawaii pomodoro"
- "pink pomodoro timer"

---

## Revenue Ideas (Premium)

| Feature | Price |
|---------|-------|
| Additional themes (Mint, Peach, Lavender) | $2.99 |
| Ghost outfit/accessory packs | $1.99 |
| Premium sound packs (ASMR, cafe, beach) | $1.99 |
| Custom color picker | $0.99 |
| Ad-free experience | $4.99 |

---

## Gap Analysis

| Factor | Competitors Have | We Have | Gap |
|--------|------------------|---------|-----|
| Cute Mascot | Birds, trees, bunnies | Ghosts | Need to show them more |
| Gentle Gamification | XP, levels, rewards | XP, levels, achievements | None |
| Pastel Aesthetics | Pink themes | Dark/Light only | **Need cute theme** |
| Ambient Sounds | Lofi, rain, nature | Only UI sounds | **Need ambient player** |
| Social/Sharing | Study together, share stats | None | Future |

---

## Communities to Monitor

**Where target users hang out** (for feedback & marketing):

| Platform | Tags/Subreddits | Notes |
|----------|-----------------|-------|
| TikTok | #studywithme, #studyaesthetic | Millions of views, viral potential |
| Instagram | #studygram | Aesthetic screenshots shared |
| Reddit | r/GetStudying, r/ADHD, r/productivity | Feature requests, honest feedback |
| Tumblr | #studyblr | OG aesthetic study community |
| YouTube | "Study with me" livestreams | Timer screenshots visible |

---

## Competitors to Watch

| App | Best At | Learn From |
|-----|---------|------------|
| [Finch](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) | Emotional connection | Non-judgmental tone, pet personality |
| [Flocus](https://flocus.com/) | Sensory experience | Ambient sounds, visual customization |
| [Flora](https://flora.appfinca.com/) | Social features | Study together, accountability |
| [Forest](https://www.forestapp.cc/) | Real-world impact | Plant real trees, 4M+ users |
| [Study Bunny](https://play.google.com/store/apps/details?id=com.yee.study) | Cute rewards | Coins for accessories |

---

## Summary

**Do now (2-3 hours total)**:
1. Cute theme (CSS only)
2. Ambient sounds (simple player)

**Do later**:
3. Ghost animations
4. Social features
5. Premium themes
