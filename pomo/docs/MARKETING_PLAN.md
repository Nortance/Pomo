# Google Ads Marketing Plan for CodeFocus.io

**Created:** January 2026
**Budget:** 100 kr/week (~$9.50 USD)
**Target Audience:** Girls/students seeking cute, aesthetic productivity tools
**Analytics:** Mixpanel

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Pre-Launch Setup | In Progress | 0/12 |
| Landing Page Optimization | Not Started | 0/5 |
| Google Ads Setup | Not Started | 0/8 |
| Launch & Optimization | Not Started | 0/6 |

---

## Phase 1: Pre-Launch Setup

### 1.1 Mixpanel Analytics Setup

| Task | Done | Date | Notes |
|------|------|------|-------|
| Create Mixpanel account (free tier: 20M events/month) | [ ] | | |
| Get project token from Mixpanel dashboard | [ ] | | |
| Install `mixpanel-browser` package | [ ] | | `npm install mixpanel-browser` |
| Create `lib/mixpanel.ts` tracking utility | [ ] | | See implementation below |
| Add MixpanelProvider to `app/layout.tsx` | [ ] | | |
| Test tracking with Mixpanel debugger | [ ] | | |

#### Mixpanel Implementation Guide

**Step 1: Install package**
```bash
npm install mixpanel-browser
npm install --save-dev @types/mixpanel-browser
```

**Step 2: Create `lib/mixpanel.ts`**
```typescript
import mixpanel from 'mixpanel-browser'

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ''

// Event names (use constants for consistency)
export const EVENTS = {
  // Core conversion events
  TIMER_STARTED: 'Timer Started',
  POMODORO_COMPLETED: 'Pomodoro Completed',

  // Engagement events
  TASK_ADDED: 'Task Added',
  TASK_COMPLETED: 'Task Completed',
  SETTINGS_CHANGED: 'Settings Changed',
  THEME_CHANGED: 'Theme Changed',

  // Monetization events
  PREMIUM_PAGE_VIEWED: 'Premium Page Viewed',
  PREMIUM_CTA_CLICKED: 'Premium CTA Clicked',

  // Retention events
  ACHIEVEMENT_UNLOCKED: 'Achievement Unlocked',
  LEVEL_UP: 'Level Up',
} as const

export const initMixpanel = () => {
  if (typeof window === 'undefined') return

  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  })
}

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return

  mixpanel.track(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  })
}

export const identify = (userId: string) => {
  if (typeof window === 'undefined') return
  mixpanel.identify(userId)
}

export const setUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  mixpanel.people.set(properties)
}
```

**Step 3: Create `components/mixpanel-provider.tsx`**
```typescript
'use client'

import { useEffect } from 'react'
import { initMixpanel } from '@/lib/mixpanel'

export function MixpanelProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initMixpanel()
  }, [])

  return <>{children}</>
}
```

**Step 4: Add to `app/layout.tsx`**
```typescript
import { MixpanelProvider } from '@/components/mixpanel-provider'

// In the body:
<MixpanelProvider>
  <ThemeProvider>
    {children}
  </ThemeProvider>
</MixpanelProvider>
```

**Step 5: Add environment variable**
```bash
# .env.local
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

### 1.2 Conversion Events to Track

| Event | Trigger Location | Priority | Done | Date |
|-------|------------------|----------|------|------|
| `Timer Started` | `app/page.tsx` - setTimerRunning(true) | Primary | [ ] | |
| `Pomodoro Completed` | `app/page.tsx` - recordPomodoro() | Primary | [ ] | |
| `Premium Page Viewed` | `app/premium/page.tsx` - on mount | Primary | [ ] | |
| `Task Added` | `app/page.tsx` - addTask() | Secondary | [ ] | |
| `Settings Changed` | `components/settings-dialog.tsx` | Secondary | [ ] | |
| `Achievement Unlocked` | `app/page.tsx` - unlockAchievement() | Secondary | [ ] | |

### 1.3 Google Ads + Mixpanel Integration

| Task | Done | Date | Notes |
|------|------|------|-------|
| Enable Google Ads integration in Mixpanel | [ ] | | Data Management > Integrations |
| Connect Google Ads account | [ ] | | Need Google Customer ID |
| Set up cohort sync for remarketing | [ ] | | Optional: for retargeting |
| Configure offline conversion import | [ ] | | Via Zapier or Make.com |

---

## Phase 2: Landing Page Optimization

| Task | Done | Date | Notes |
|------|------|------|-------|
| Add clear headline above fold | [ ] | | "Free Cute Pomodoro Timer" |
| Add tagline matching ad copy | [ ] | | "The Cutest Way to Stay Focused" |
| Make CTA visible on mobile without scroll | [ ] | | |
| Add social proof (user count or testimonials) | [ ] | | |
| Run PageSpeed Insights, achieve 90+ score | [ ] | | Current score: ___ |

### Message Match Requirements

Ad copy will say → Landing page must show:
- "Cute Pomodoro Timer" → Visible "cute" messaging
- "Free" → Clear that it's free
- "No Download" → Web-based messaging
- "For Girls/Students" → Kawaii aesthetic visible

---

## Phase 3: Google Ads Account Setup

| Task | Done | Date | Notes |
|------|------|------|-------|
| Create Google Ads account | [ ] | | ads.google.com |
| Set up billing (100 kr/week limit) | [ ] | | |
| Create conversion actions in Google Ads | [ ] | | Import from Mixpanel or manual |
| Link Google Analytics 4 (optional) | [ ] | | |
| Verify conversion tracking works | [ ] | | Use Tag Assistant |

### Conversion Actions to Create

| Conversion Name | Type | Value | Done | Date |
|-----------------|------|-------|------|------|
| Timer Started | Primary | $0.10 | [ ] | |
| Pomodoro Completed | Primary | $0.50 | [ ] | |
| Premium Page View | Secondary | $0.25 | [ ] | |

---

## Phase 4: Campaign Creation

| Task | Done | Date | Notes |
|------|------|------|-------|
| Create campaign "Pomodoro Timer - Search" | [ ] | | |
| Set budget to $1.35/day | [ ] | | |
| Set bidding to Manual CPC, max $1.50 | [ ] | | |
| Set locations: US, UK, CA, AU | [ ] | | |
| Create ad group "Core Timer" | [ ] | | |
| Add exact match keywords | [ ] | | See list below |
| Add negative keywords | [ ] | | See list below |
| Create 3 Responsive Search Ads | [ ] | | See copy below |
| Add sitelink extensions | [ ] | | |
| Add callout extensions | [ ] | | |

### Keywords to Add (Exact Match)

```
[pomodoro timer]
[cute pomodoro timer]
[pomodoro timer online]
[free pomodoro timer]
```

### Negative Keywords to Add

```
download
app store
ios
android
chrome extension
desktop
windows
mac
reddit
review
vs
alternative
github
open source
code
api
tomato
recipe
food
```

### Ad Copy - Responsive Search Ads

**Headlines (use all 15):**
1. Free Pomodoro Timer Online
2. Cute Pomodoro Timer - Free
3. Start Focusing in Seconds
4. No Download Required
5. Beautiful & Simple Timer
6. The Cutest Focus Timer
7. Free Online Pomodoro
8. Kawaii Study Timer
9. Stay Focused, Stay Cute
10. Works on Any Device
11. Aesthetic Study Timer
12. Pink Pomodoro Timer
13. Study Timer for Girls
14. Track Your Focus Time
15. 100% Free Forever

**Descriptions (use all 4):**
1. Start your pomodoro session instantly. No sign-up, no download. Just focus. Try it free now.
2. The cutest way to stay productive. Simple pomodoro timer with beautiful design. 100% free.
3. Track your focus sessions with our adorable timer. Perfect for students. Start free today.
4. No ads, no distractions. Just you and your pomodoro timer. Try CodeFocus free.

### Extensions

**Sitelinks:**
- "Premium Features" → /premium
- "Sign In" → /signin

**Callouts:**
- 100% Free
- No Sign-Up Required
- Works Offline
- Mobile Friendly

---

## Phase 5: Launch & Optimization

### Week 1-2: Data Gathering

| Task | Done | Date | Notes |
|------|------|------|-------|
| Launch campaign | [ ] | | |
| Check ads are showing (impressions > 0) | [ ] | | |
| Verify conversions are tracking | [ ] | | |
| Document initial CTR and CPC | [ ] | | CTR: ___ CPC: $___ |

### Week 3-4: Optimization

| Task | Done | Date | Notes |
|------|------|------|-------|
| Review Search Terms report | [ ] | | |
| Add new negative keywords | [ ] | | |
| Pause underperforming ads | [ ] | | |
| Adjust bids if needed | [ ] | | |

### Ongoing Weekly Checklist

| Week | Search Terms Reviewed | Negatives Added | Performance Notes |
|------|----------------------|-----------------|-------------------|
| 1 | [ ] | | |
| 2 | [ ] | | |
| 3 | [ ] | | |
| 4 | [ ] | | |
| 5 | [ ] | | |
| 6 | [ ] | | |
| 7 | [ ] | | |
| 8 | [ ] | | |

---

## Phase 6: Alternative Channels (Parallel)

| Channel | Done | Date | Results |
|---------|------|------|---------|
| Product Hunt launch | [ ] | | |
| Reddit r/productivity post | [ ] | | |
| Reddit r/GetStudying post | [ ] | | |
| TikTok "study with me" video | [ ] | | |
| Instagram Reels | [ ] | | |

---

## Performance Tracking

### Weekly Metrics Log

| Week | Spend | Clicks | CTR | CPC | Conversions | Conv Rate | Notes |
|------|-------|--------|-----|-----|-------------|-----------|-------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |
| 6 | | | | | | | |
| 7 | | | | | | | |
| 8 | | | | | | | |

### Target KPIs

| Metric | Target (Month 1) | Target (Month 3) | Current |
|--------|------------------|------------------|---------|
| CTR | >5% | >8% | - |
| CPC | <$2 | <$1.50 | - |
| Conversion Rate | >10% | >15% | - |
| Cost per Conversion | <$10 | <$5 | - |
| Quality Score | 7+ | 8+ | - |

### Decision Criteria

**Continue ads if:**
- [ ] Cost per "Pomodoro Completed" < $5
- [ ] Quality Score stays above 7
- [ ] CTR exceeds 5%

**Pause ads if:**
- [ ] CPC exceeds $4 consistently
- [ ] Quality Score drops below 5
- [ ] Zero conversions after 100 clicks

---

## Resources & References

### Mixpanel Setup
- [Mixpanel Next.js Official Docs](https://docs.mixpanel.com/docs/tracking-methods/integrations/nextjs)
- [Mixpanel Next.js 14 Setup Guide](https://www.batra.dev/blog/how-to-set-up-mixpanel-into-your-nextjs)
- [Mixpanel Analytics in Next.js](https://dev.to/mohammadfaisal/setup-mixpanel-analytics-in-a-nextjs-application-49ae)

### Mixpanel + Google Ads
- [Mixpanel Google Ads Integration](https://docs.mixpanel.com/docs/cohort-sync/integrations/google-ads)
- [Google Ads Conversions + Mixpanel via Make](https://www.make.com/en/integrations/google-ads-conversions/mixpanel)
- [Zapier Google Ads + Mixpanel](https://zapier.com/apps/google-ads/integrations/mixpanel)

### Google Ads Strategy
- [Google Ads for SaaS 2025](https://www.tripledart.com/saas-ppc/google-ads-for-saas)
- [Google Ads on $10/Day](https://www.definedigitalacademy.com/blog/google-ads-small-budget-strategy)
- [Small Budget Google Ads Tips](https://marlinsem.com/do-google-ads-work-on-a-small-budget/)
- [Landing Page Optimization 2025](https://datastreetmarketing.com/google-ads-landing-page-tips-2025/)
- [Google Ads Copy Best Practices](https://www.wordstream.com/blog/google-ads-copy)

---

## Changelog

| Date | Change | By |
|------|--------|-----|
| Jan 2026 | Initial plan created | Claude |
| Jan 2026 | Converted to checklist format, added Mixpanel setup | Claude |
