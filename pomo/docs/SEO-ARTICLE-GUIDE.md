# SEO Article Writing Guide for CodeFocus

> **TL;DR:** Write like a human developer sharing experiences, not a textbook. Target 90%+ human score. Use contractions, personal anecdotes, specific numbers, and opinions.

---

## Quick Reference

### Target Metrics
| Metric | Target |
|--------|--------|
| Human Score | **90%+** |
| Word Count | 1,500-2,500 |
| Reading Level | Grade 8-10 |

### Before Publishing Checklist
```bash
npm run ai-check -- --file articles/your-article.md
# Must show: PASS (90%+)
```

---

## The Golden Rules

### 1. CONTRACTIONS (Always Use)
```
❌ "It is important to understand that you cannot..."
✅ "Here's the thing—you can't just..."
```

### 2. PERSONAL ANECDOTES (2-3 Per Article)
```
❌ "The Pomodoro technique helps developers focus."
✅ "I was mass-tabbing through Stack Overflow when I realized I'd wasted
    two hours. That's when I finally tried Pomodoro—and honestly? It changed
    how I code."
```

### 3. SPECIFIC NUMBERS (Not Rounded)
```
❌ "about 25 minutes"
✅ "23 minutes (I've found 25 feels slightly too long for debugging)"
```

### 4. OPINIONS & VOICE
```
❌ "Many developers find this useful."
✅ "Look, I was skeptical too. But after three weeks, I'm a convert."
```

### 5. RHETORICAL QUESTIONS
```
❌ "Focus is important for developers."
✅ "Ever sat down to fix a 'quick bug' and looked up to find 4 hours gone?"
```

### 6. INFORMAL TRANSITIONS
```
❌ "Furthermore, it is worth noting..."
✅ "Here's the thing..."
✅ "But wait—"
✅ "Honestly?"
✅ "The weird part is..."
```

### 7. VARIED SENTENCE LENGTH
```
❌ "The Pomodoro technique is a time management method. It uses 25-minute
    work intervals. These are followed by short breaks. The breaks help
    maintain focus."

✅ "The Pomodoro technique? Dead simple. Work for 25 minutes, break for 5.
    That's it. But here's why it actually works for code: your brain gets
    a hard deadline, and suddenly that 'I'll just check Twitter real quick'
    urge has a timer on it."
```

---

## Article Structure Template

```markdown
# [Compelling Title with Keyword]

[Hook - Personal story or provocative question, 2-3 sentences]

[Brief overview of what reader will learn]

## The Problem [or "Why This Matters"]
[Relatable scenario the reader has experienced]
[Your personal experience with this problem]

## The Solution: [Main Topic]
[Explain the concept]
[Your specific implementation/twist on it]

### [Subsection 1]
[Content with personal example]

### [Subsection 2]
[Content with specific data/numbers]

### [Subsection 3]
[Content with opinion or contrarian take]

## What Actually Works (My Experience)
[Your real results with specific numbers]
[What surprised you]
[What didn't work]

## Common Mistakes
[Things you did wrong initially]
[What you learned]

## Start Here
[Single actionable next step]
[Link to CodeFocus if relevant]

---
*[Personal sign-off or question to readers]*
```

---

## Patterns That Trigger AI Detection

### AVOID These:
- Perfect parallel structure in lists
- Every paragraph same length
- No contractions anywhere
- Overuse of "Furthermore," "Moreover," "Additionally"
- Generic statements without specifics
- Passive voice throughout
- No first-person perspective
- Predictable intro → body → conclusion flow
- Every section perfectly balanced

### USE These Instead:
- Mix bullet points with prose
- Vary paragraph lengths dramatically (1 sentence to 5+)
- Interrupt yourself with asides
- Use parentheticals (like this)
- Include incomplete sentences. For emphasis.
- Start sentences with "And" or "But"
- Add em-dashes for interruptions—they feel natural
- Include a controversial or unexpected opinion

---

## Per-Section Humanization

### Introduction
- Start with "I" or a question
- Include a specific moment/memory
- Keep it under 100 words

### Body Sections
- Lead with experience before theory
- Include at least one "I thought X but actually Y"
- Add specific tools, numbers, or examples

### Conclusion
- Don't summarize everything
- End with a single action or question
- Optional: personal reflection

---

## Iteration Workflow

```
Draft 1: Get ideas down (expect ~50-60% score)
   ↓
Draft 2: Add anecdotes + contractions (expect ~70-80%)
   ↓
Draft 3: Vary structure + add opinions (target 90%+)
```

### Commands
```bash
# Check current score
npm run ai-check -- --file articles/draft.md

# Quick score only
npm run ai-check -- --file articles/draft.md --quiet
```

---

## Topic-Specific Tips for CodeFocus

### Pomodoro Articles
- Share your actual timer settings (not just "25/5")
- Mention specific coding tasks it helped with
- Include failures: "Pomodoro doesn't work for..."

### Productivity Articles
- Reference real tools you've tried
- Include your workspace/setup details
- Share actual metrics if possible

### Developer Focus Articles
- Mention specific languages/frameworks
- Include code-related examples
- Reference developer culture (Stack Overflow, GitHub, etc.)

---

## Example Transformations

### Before (AI-like, ~45% score):
> The Pomodoro Technique is a time management method developed by Francesco
> Cirillo. It uses a timer to break work into intervals, traditionally 25
> minutes in length, separated by short breaks. This technique can help
> developers maintain focus and avoid burnout.

### After (Human, ~92% score):
> I'll be honest—I thought the Pomodoro Technique was productivity theater.
> A tomato timer? Really? But after mass-tabbing through Stack Overflow for
> the third time in an hour, I was desperate enough to try anything.
>
> Twenty-three minutes. That's my magic number. (The traditional 25 felt
> slightly too long when I'm debugging.) One interval to fix a bug, no
> checking Slack, no "quick" email checks. And here's the weird part: knowing
> the break is coming makes it easier to ignore distractions.

---

## Final Checklist

Before running `npm run ai-check`:

- [ ] Article has 2-3 personal anecdotes
- [ ] Using contractions throughout
- [ ] At least one opinion or hot take
- [ ] Specific numbers (not rounded)
- [ ] Varied sentence/paragraph lengths
- [ ] Rhetorical questions in intro or transitions
- [ ] No "Furthermore/Moreover/Additionally" chains
- [ ] Informal transitions ("Here's the thing", "But wait")
- [ ] First-person voice present
- [ ] At least one em-dash or parenthetical aside

**Target: 90%+ human score before publishing**
