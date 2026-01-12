# CodeFocus SEO Plan

> One document. All steps. Follow in order.

**Primary Niche**: Aesthetic/cute productivity tools
**Why**: Unique differentiator. Captures students, devs, designers, creatives who all search "cute timer" or "aesthetic productivity."

---

## Quick Reference

```bash
npm run keywords -- "cute pomodoro" "aesthetic timer"       # Research keywords
npm run ai-check -- --file content/articles/X.mdx           # Check AI score (need 90%+)
npm run generate-image -- "kawaii prompt" --name hero       # Generate DALL-E 3 image (~$0.08)
npm run webp -- public/images/articles --all                # Convert to WebP (~95% smaller)
```

**Notes**:
- `npm run keywords` uses pytrends which can be rate-limited by Google. Wait 60s and retry if errors.
- `npm run generate-image` requires `OPENAI_API_KEY` in `.env`

---

## SEO Strategy: Niche Dominance

```
PHASE 1 (Month 1-4): Dominate "aesthetic/cute productivity"
    └─ 10+ articles, all reinforcing this niche
    └─ Goal: Rank top 10 for "cute pomodoro timer"

PHASE 2 (Month 5-8): Expand to "pomodoro for students"
    └─ Adjacent niche, overlaps with aesthetic seekers
    └─ 5-8 student-focused articles

PHASE 3 (Month 9+): Expand to "pomodoro for developers/creatives"
    └─ Only after establishing authority in Phase 1-2
```

---

## Phase 1: Aesthetic Productivity Cluster

### Primary Keywords (All articles reinforce these)

- `cute pomodoro timer` ← **#1 target**
- `aesthetic study timer`
- `kawaii timer`
- `aesthetic productivity app`
- `cute focus timer`
- `cozy study setup`

### Pillar Page (Write First)
**"The Ultimate Guide to Aesthetic Productivity"**
- Filename: `content/articles/aesthetic-productivity-guide.mdx`
- 3,500 words
- Target: "aesthetic productivity", "cute productivity tools"
- Covers: What aesthetic productivity is, why it works, tools, setups, routines
- Links to ALL cluster articles
- **Create this BEFORE cluster articles**

### Cluster Articles (All Aesthetic-Focused)

| # | Article | Keywords | Words |
|---|---------|----------|-------|
| 1 | The Cutest Pomodoro Timers in 2026 (Ranked) | cute pomodoro timer, kawaii timer | 2,500 |
| 2 | How to Create the Perfect Cozy Study Setup | cozy study setup, aesthetic desk | 2,000 |
| 3 | Aesthetic Productivity: Why Pretty Tools Make You More Focused | aesthetic productivity, cute apps | 2,200 |
| 4 | 10 Free Aesthetic Apps for Students & Creatives | free aesthetic apps, cute study apps | 2,500 |
| 5 | Lo-fi + Pomodoro: The Perfect Focus Combination | lofi study, pomodoro music | 1,800 |
| 6 | Kawaii Productivity: Japanese-Inspired Focus Techniques | kawaii productivity, japanese study | 2,000 |
| 7 | Why Your Workspace Aesthetic Affects Your Focus (Science) | workspace aesthetic, productivity science | 2,200 |
| 8 | Aesthetic Study Routine: A Day Using Cute Productivity Tools | aesthetic routine, study with me | 1,500 |
| 9 | Dark Mode vs Light Mode: Which is Better for Focus? | dark mode productivity, aesthetic themes | 1,800 |
| 10 | Building Your Aesthetic Digital Workspace | digital workspace, aesthetic setup | 2,000 |

### Internal Linking Strategy

Every article links to:
- Pillar page (early in article)
- 2-3 sibling articles (naturally in content)
- CodeFocus app CTA (`/`)

```
                    ┌─────────────────────┐
                    │   PILLAR PAGE       │
                    │ Aesthetic           │
                    │ Productivity Guide  │
                    └─────────┬───────────┘
                              │
        ┌─────────┬─────────┬─┴──┬─────────┬─────────┐
        ▼         ▼         ▼    ▼         ▼         ▼
    [Cutest   [Cozy    [Why    [Free   [Lo-fi]  [Kawaii]
    Timers]   Setup]   Pretty]  Apps]
        │         │         │    │         │         │
        └─────────┴─────────┴────┴─────────┴─────────┘
                    (interlinked)
```

### Content Tone Guidelines

- **Voice**: Cozy, friendly, like a friend sharing their favorite finds
- **Aesthetic words**: Cozy, cute, aesthetic, minimal, clean, kawaii, soft
- **Avoid**: Hustle culture, "grind", aggressive productivity
- **Include**: Visual descriptions, setup photos, app screenshots
- **Emojis**: Yes, sparingly (✨🌸💻)
- **References**: Studio Ghibli vibes, Pinterest aesthetics, soft girl/soft boy energy

---

## Phase 2: Writing Process

### For Each Article

```
1. RESEARCH (5 min)
   └─ npm run keywords -- "your topic"
   └─ Note rising queries for H2s

2. OUTLINE (10 min)
   └─ Hook: Personal story or question
   └─ Problem: Relatable dev scenario
   └─ Solution: 3 subsections with keywords
   └─ Results: Your real numbers
   └─ CTA: Link to CodeFocus

3. DRAFT (45 min)
   └─ Write fast, don't edit
   └─ Expect 50-60% AI score

4. HUMANIZE (20 min)
   └─ Add 2-3 personal anecdotes
   └─ Use contractions everywhere
   └─ Add opinions ("Honestly, I think...")
   └─ Vary sentence length
   └─ Add em-dashes and parentheticals

5. CHECK (2 min)
   └─ npm run ai-check -- --file content/articles/X.mdx
   └─ If <90%: Add more anecdotes, vary structure
   └─ Repeat until 90%+

6. OPTIMIZE (10 min)
   └─ Add 3-5 internal links
   └─ Add 2-3 external authority links
   └─ Fill frontmatter completely

7. GENERATE IMAGE
   └─ npm run generate-image -- "kawaii prompt" --name article-slug-hero
   └─ Use cute/kawaii aesthetic prompts
   └─ Cost: ~$0.08 per image (DALL-E 3, 1792x1024)

8. OPTIMIZE IMAGE
   └─ npm run webp -- public/images/articles --all
   └─ Converts PNG to WebP (~95% smaller)
   └─ Update frontmatter: image: /images/articles/slug-hero.webp

9. PUBLISH
   └─ npm run build (must pass)
   └─ Set published: true
```

---

## Phase 3: Humanization Rules

### Always Do
- Contractions: "don't", "can't", "here's"
- Specific numbers: "23 minutes" not "about 25"
- First person: "I found", "In my experience"
- Rhetorical questions: "Ever lost 4 hours to a 'quick bug'?"
- Informal transitions: "Here's the thing", "But wait"

### Never Do
- "Furthermore", "Moreover", "Additionally"
- Perfect parallel structure in every list
- Same-length paragraphs throughout
- Passive voice: "It was found that..."
- Rounded numbers: "approximately 25"

### Example Transform

**Before (55% score):**
> The Pomodoro Technique is a time management method. It uses 25-minute intervals. Breaks follow each interval. This helps maintain focus.

**After (92% score):**
> I'll be honest—I thought Pomodoro was productivity theater. A tomato timer? But after mass-tabbing Stack Overflow for the third time, I tried it. Twenty-three minutes (25 felt too long for debugging). One interval, no Slack, no "quick" emails. Here's the weird part: knowing the break is coming makes ignoring distractions easier.

---

## Phase 4: Article Frontmatter

```yaml
---
title: "Primary Keyword: Hook Under 60 Chars"
description: "Benefit-focused summary under 160 chars."
date: "2026-01-15"
author: "CodeFocus Team"
image: /images/articles/hero-slug.jpg
imageAttribution:
  photographer: "From fetch-image output"
  photographerUrl: "From fetch-image output"
  source: unsplash
tags:
  - pomodoro
  - productivity
  - developers
published: true
---
```

### Filename Convention

```
content/articles/{slug}.mdx

Rules:
- Lowercase only
- Hyphens between words (no underscores/spaces)
- Match the URL slug exactly
- Keep under 50 characters

Examples:
✓ pomodoro-vs-flow-state.mdx
✓ 5-pomodoro-mistakes.mdx
✗ Pomodoro_Mistakes.mdx
✗ my article about pomodoro.mdx
```

---

## Phase 5: Internal Linking

Every article must link to:
- [ ] Pillar page (once, early in article)
- [ ] 1-2 sibling cluster articles
- [ ] CodeFocus app (`/`) in CTA
- [ ] 2-3 external authority sources

---

## Phase 6: Success Metrics

| Metric | Month 3 Target | Month 6 Target |
|--------|----------------|----------------|
| Articles published | 15 | 35 |
| Organic sessions | 1,000 | 5,000 |
| Keywords in top 20 | 5 | 15 |
| AI score average | 90%+ | 90%+ |

Track via: Google Search Console (free)

---

## Competitors to Beat

| Competitor | Their Strength | Our Angle |
|------------|---------------|-----------|
| Todoist | Authority, comprehensive | Developer-specific |
| Zapier | App roundups | We ARE the app |
| Pomofocus | Popular free tool | Content + tool combined |

---

## Files

```
content/articles/[locale]/ # MDX articles by locale (en/, es/, de/, etc.)
public/images/articles/    # Images go here (shared across locales)
docs/SEO-PLAN.md          # This file (the plan)
docs/ARTICLES.md          # Technical MDX docs
```

---

## Checklist Per Article

Before publishing, verify ALL:

- [ ] AI score 90%+
- [ ] Word count meets target
- [ ] 2-3 personal anecdotes
- [ ] Contractions used throughout
- [ ] 3-5 internal links
- [ ] Hero image with attribution
- [ ] Frontmatter complete
- [ ] `npm run build` passes

---

## Phase 7: Internationalization (i18n)

> **Critical insight**: Don't translate everything. Translate what's proven.

### Strategy: English-First, Localize Winners

```
Month 1-3: English only
    └─ Build pillar + clusters
    └─ Track which articles get traffic
    └─ Perfect the AI detection workflow

Month 4+: Strategic localization
    └─ Translate ONLY top 5 performers
    └─ Start with Spanish + German (largest EU markets)
    └─ Add others based on analytics
```

**Why this approach:**
- 80% of SEO value comes from 20% of articles
- Translation is expensive (time/money)
- Bad translations hurt more than no translations
- English content ranks globally anyway

### AI Detection Reality for Non-English

**The problem**: Zippy and RoBERTa are trained on English. They don't work reliably for other languages.

| Language | AI Detection | Solution |
|----------|--------------|----------|
| English | Zippy + RoBERTa (90%+ target) | Our standard workflow |
| Spanish | Zippy only (~70% reliable) | Zippy + native review |
| German | Zippy only (~70% reliable) | Zippy + native review |
| French | Zippy only (~70% reliable) | Zippy + native review |
| Portuguese | Zippy only (~60% reliable) | Native review required |
| Japanese | Unreliable | Native review only |
| Chinese | Unreliable | Native review only |

**Bottom line**: For non-English, native speaker review replaces AI detection as the quality gate.

### Translation Workflow

```
1. SELECT (Only proven articles)
   └─ Must have 500+ organic sessions in English
   └─ Or: Strategic importance (pillar page)

2. TRANSLATE (LLM with cultural context)
   └─ Use Claude with localization prompt (below)
   └─ NOT word-for-word, adapt cultural references
   └─ Keep personal anecdotes but localize examples

3. LOCALIZE (Language-specific humanization)
   └─ Add native idioms and expressions
   └─ Adjust formality for culture
   └─ Replace English-specific references
   └─ Research local keywords (different search terms!)

4. CHECK (What's available)
   └─ Run: npm run ai-check (for reference, not gospel)
   └─ Primary gate: Native speaker review

5. NATIVE REVIEW (Required for all non-English)
   └─ Does it sound like a native wrote it?
   └─ Are idioms natural or forced?
   └─ Would a reader trust this author?

6. PUBLISH
   └─ Same file, different locale route
   └─ Update sitemap automatically
```

### LLM Translation Prompt

Use this prompt when translating with Claude:

```
Translate this article to [LANGUAGE].

CRITICAL RULES:
1. This is LOCALIZATION, not translation. Adapt, don't just convert.
2. Keep the personal voice and anecdotes but adapt cultural references.
3. Use native idioms - if "hit the nail on the head" doesn't exist in [LANGUAGE], use the equivalent native expression.
4. Match the formality level expected in [LANGUAGE] tech blogs.
5. Numbers and specific data stay the same.
6. The goal: A native [LANGUAGE] speaker should think "this was written by someone like me."

AVOID:
- Literal translations that sound robotic
- Keeping English idioms that don't translate
- Overly formal language (unless culture demands it)
- Translation artifacts ("In this article, we will discuss...")

OUTPUT: Natural [LANGUAGE] that passes as native-written content.
```

### Language-Specific Humanization

Each language has different "natural" patterns:

**Spanish (es)**
- Use tuteo (tú) for tech blogs, not usted
- Rich idiomatic expressions: "al grano" (to the point)
- Contractions: "pa'" instead of "para" in casual speech
- Exclamations: ¡ and ¿ add authenticity

**German (de)**
- Compound words are natural and expected
- More formal than English, but tech is exception
- Anglicisms are accepted in tech (der Code, das Meeting)
- Precise, structured sentences valued

**French (fr)**
- Strict grammar matters (accents, agreements)
- "On" instead of "nous" for casual tone
- Avoid too many anglicisms (use "ordinateur" not "computer")
- Rhetorical questions work well

**Portuguese (pt)**
- Brazilian vs European: choose one, be consistent
- Very conversational tone acceptable
- "Você" (BR) vs "Tu" (PT) distinction
- Diminutives add warmth (pouquinho, rapidinho)

**Japanese (ja)**
- Formality levels critical (です/ます for blogs)
- Sentence-final particles add naturalness (ね, よ)
- Different word order - don't force English structure
- Cultural context heavy - adapt examples

**Chinese (zh)**
- Simplified (CN) vs Traditional (TW) - choose one
- Four-character idioms (成语) add sophistication
- Concise expression preferred
- Internet slang for younger audience (optional)

### File Structure for Translations

Articles are organized by locale folder:

```
content/articles/
├── en/                              # English (default)
│   └── pomodoro-vs-flow-state.mdx
├── es/                              # Spanish
│   └── pomodoro-vs-flow-state.mdx
└── de/                              # German
    └── pomodoro-vs-flow-state.mdx

Routes automatically generated:
/en/articles/pomodoro-vs-flow-state  → English
/es/articles/pomodoro-vs-flow-state  → Spanish
/de/articles/pomodoro-vs-flow-state  → German
...
```

**Fallback behavior**: If a translation doesn't exist for a locale, the system automatically falls back to English.

### Translation Priority Matrix

| Article | Traffic | Translate To | Priority |
|---------|---------|--------------|----------|
| Pillar (Aesthetic Productivity Guide) | - | es, de first | P0 |
| Top performer #1 | 1000+ | es, de, fr | P1 |
| Top performer #2 | 500+ | es, de | P1 |
| Others | <500 | Wait | P2 |

### Quality Checklist for Translations

- [ ] Native speaker confirmed it sounds natural
- [ ] Cultural references adapted (not just translated)
- [ ] Local idioms used appropriately
- [ ] Formality level matches target culture
- [ ] No translation artifacts ("In this article...")
- [ ] Keywords researched for target language
- [ ] AI check run (for reference, not blocking)
- [ ] Read aloud test: Does it flow?

---

## Summary: The Complete Flow

```
ENGLISH ARTICLE
     │
     ▼
┌─────────────────────────────────────┐
│  Phase 1-6: Write, humanize, check  │
│  AI score must be 90%+              │
│  Publish to /en/articles/slug       │
└─────────────────────────────────────┘
     │
     ▼
   Wait for traffic data (1-2 months)
     │
     ▼
   Article gets 500+ sessions?
     │
     ├─── NO ──→ Keep in English only
     │
     └─── YES ─→ Phase 7: Translate
                      │
                      ▼
              ┌───────────────────────────────┐
              │  Translate with LLM prompt    │
              │  Localize (don't just convert)│
              │  Native speaker review        │
              │  Publish to /[locale]/...     │
              └───────────────────────────────┘
```

---

## Phase 2: Student Expansion (Month 5-8)

**Only start after Phase 1 ranking success** (top 20 for "cute pomodoro timer")

### Student Cluster Articles

| # | Article | Keywords | Words |
|---|---------|----------|-------|
| 1 | How I Aced My Finals Using the Pomodoro Technique | pomodoro for exams | 1,800 |
| 2 | Best Study Timer Apps for Students 2026 | study timer app, student timer | 2,500 |
| 3 | Pomodoro Technique for Online Classes | online study, remote learning | 2,000 |
| 4 | Why 25 Minutes is the Perfect Study Session | pomodoro science | 2,200 |
| 5 | Study With Me: A Day Using Pomodoro | study with me | 1,500 |

**Note**: These still tie back to aesthetic angle where natural ("cute study setup", "aesthetic study routine").

---

## Phase 3: Developer/Creative Expansion (Month 9+)

**Only start after Phase 2** and strong domain authority

### Developer Cluster

| # | Article | Keywords |
|---|---------|----------|
| 1 | Pomodoro for Developers: Code in Flow State | pomodoro for coding |
| 2 | Best Productivity Tools for Developer Girls | developer productivity |
| 3 | Debugging with Pomodoro: Structured Problem Solving | debugging technique |

### Designer/Creative Cluster

| # | Article | Keywords |
|---|---------|----------|
| 1 | Pomodoro for Designers: Creative Focus Without Burnout | designer productivity |
| 2 | Managing Creative Blocks with Time Boxing | creative block |
| 3 | Freelancer Productivity: Pomodoro for Client Work | freelancer productivity |

---

## Success Criteria by Phase

| Phase | Success Metric | Move to Next When |
|-------|---------------|-------------------|
| 1 | Rank top 20 for "cute pomodoro timer" | 3+ articles in top 20 |
| 2 | 5,000+ monthly organic sessions | Student articles ranking |
| 3 | 15,000+ monthly organic sessions | Established authority |

Track via: Google Search Console (free)
