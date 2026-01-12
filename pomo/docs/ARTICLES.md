# Articles System Documentation

> **TL;DR:** Write MDX files in `content/articles/`, fetch images with `npm run fetch-image`, always include attribution.

---

## Quick Start

### 1. Create Article

```bash
# Create new article file
touch content/articles/my-article-slug.mdx
```

### 2. Add Frontmatter

```yaml
---
title: "Your Article Title"
description: "A compelling description for SEO"
date: "2026-01-15"
author: "CodeFocus Team"
image: /images/articles/my-image.jpg  # Optional
imageAttribution:                      # Required if image is set
  photographer: "John Doe"
  photographerUrl: "https://unsplash.com/@johndoe"
  source: unsplash
tags:
  - pomodoro
  - productivity
published: true  # Set to false to hide
---
```

### 3. Fetch Hero Image

```bash
# Set your Unsplash API key (free)
export UNSPLASH_ACCESS_KEY=your_key_here

# Fetch image
npm run fetch-image -- "developer coding laptop" --name my-image

# Copy the output to your frontmatter
```

### 4. Write Content & Check AI Score

```bash
# Check AI detection score (target: 90%+)
npm run ai-check -- --file content/articles/my-article-slug.mdx
```

### 5. Build & Preview

```bash
npm run dev
# Visit: http://localhost:3000/en/articles/my-article-slug
```

---

## File Structure

```
content/
└── articles/
    ├── my-first-article.mdx
    └── another-article.mdx

public/
└── images/
    └── articles/
        ├── hero-image.jpg
        └── inline-image.jpg
```

---

## Fetching Images

### Setup (One-Time)

1. Create free Unsplash account: https://unsplash.com/join
2. Create app: https://unsplash.com/oauth/applications
3. Copy Access Key
4. Add to `.env.local`:
   ```
   UNSPLASH_ACCESS_KEY=your_key_here
   ```

### Usage

```bash
# Basic usage
npm run fetch-image -- "search query" --name filename

# Examples
npm run fetch-image -- "pomodoro timer tomato" --name hero-pomodoro
npm run fetch-image -- "developer focus coding" --name dev-focus
npm run fetch-image -- "productivity workspace" --name workspace --size 800x400
```

### Output

The script outputs:
1. Image saved to `public/images/articles/{name}.jpg`
2. Frontmatter snippet to copy
3. `<ArticleImage>` component snippet for inline use

---

## Image Attribution

### ALWAYS Include Attribution

Even though Unsplash/Pexels don't legally require it, we always attribute:

1. **Hero images**: Use `imageAttribution` in frontmatter
2. **Inline images**: Use `<ArticleImage>` component

### Hero Image (Frontmatter)

```yaml
image: /images/articles/my-image.jpg
imageAttribution:
  photographer: "John Doe"
  photographerUrl: "https://unsplash.com/@johndoe?utm_source=codefocus&utm_medium=referral"
  source: unsplash  # or: pexels, pixabay
```

### Inline Images (Component)

```jsx
<ArticleImage
  src="/images/articles/coding-setup.jpg"
  alt="A developer's workspace with dual monitors"
  photographer="Jane Smith"
  photographerUrl="https://unsplash.com/@janesmith?utm_source=codefocus&utm_medium=referral"
  source="unsplash"
/>
```

### Attribution Format

The component renders:
```
Photo by John Doe on Unsplash
        ↑ linked      ↑ linked
```

---

## MDX Features

### Available Components

```jsx
// Image with attribution
<ArticleImage
  src="/images/articles/example.jpg"
  alt="Description"
  photographer="Name"
  photographerUrl="https://..."
  source="unsplash"
/>
```

### Standard Markdown

All standard markdown works:
- **Bold**, *italic*, `code`
- Lists (ordered and unordered)
- Blockquotes
- Code blocks with syntax highlighting
- Links and images
- Tables

---

## SEO Checklist

Before publishing, verify:

- [ ] **Title**: 50-60 characters, includes target keyword
- [ ] **Description**: 150-160 characters, compelling
- [ ] **Image**: Has attribution, optimized size (1200x630 for hero)
- [ ] **AI Score**: 90%+ human score
- [ ] **Word Count**: 1,500-2,500 words
- [ ] **Tags**: 3-5 relevant tags
- [ ] **Internal Links**: Link to app (`/`) or other articles

---

## Article Writing Tips

### Follow the SEO Guide

See `docs/SEO-ARTICLE-GUIDE.md` for writing tips to pass AI detection.

### Key Points

1. **Use contractions**: "don't" not "do not"
2. **Add anecdotes**: 2-3 personal stories per article
3. **Specific numbers**: "23 minutes" not "about 25"
4. **Opinions**: "Honestly, I think..."
5. **Vary sentence length**: Mix short. And longer flowing sentences.

### Workflow

```
1. Write draft → content/articles/my-article.mdx
2. Check score → npm run ai-check -- --file content/articles/my-article.mdx
3. Revise if < 90%
4. Repeat until PASS
5. Fetch images → npm run fetch-image
6. Build & preview → npm run dev
```

---

## Troubleshooting

### "No articles found"

Check that your MDX file:
- Is in `content/articles/`
- Has `.mdx` extension
- Has valid frontmatter with `published: true`

### Image not showing

1. Verify image exists in `public/images/articles/`
2. Check path starts with `/images/articles/`
3. Run `npm run build` to check for errors

### AI score too low

Review `docs/SEO-ARTICLE-GUIDE.md` and:
- Add more personal anecdotes
- Use contractions throughout
- Vary sentence structure
- Add opinions and rhetorical questions

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run fetch-image -- "query" --name filename` | Fetch image from Unsplash |
| `npm run ai-check -- --file path/to/article.mdx` | Check AI detection score |
| `npm run dev` | Preview articles locally |
| `npm run build` | Build for production |
