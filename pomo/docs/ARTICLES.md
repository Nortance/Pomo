# Articles System Documentation

> **TL;DR:** Write MDX files in `content/articles/[locale]/` (e.g., `en/`, `es/`), generate images with `npm run generate-image`, always include attribution.

---

## Quick Start

### 1. Create Article

```bash
# Create new article file in the English folder (default)
touch content/articles/en/my-article-slug.mdx

# Or for translations in other languages
touch content/articles/es/my-article-slug.mdx  # Spanish
touch content/articles/de/my-article-slug.mdx  # German
```

### 2. Add Frontmatter

```yaml
---
title: "Your Article Title"
description: "A compelling description for SEO"
date: "2026-01-15"
author: "CodeFocus Team"
image: /images/articles/my-image.webp  # Optional
tags:
  - pomodoro
  - productivity
published: true  # Set to false to hide
---
```

### 3. Generate Hero Image

```bash
# Generate image with DALL-E 3 (requires OPENAI_API_KEY in .env.local)
npm run generate-image -- "kawaii aesthetic desk setup with pink accessories" --name my-image

# Convert to WebP for optimization
npm run webp -- public/images/articles --all
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
    ├── en/                        # English (default)
    │   ├── my-first-article.mdx
    │   └── another-article.mdx
    ├── es/                        # Spanish translations
    │   └── my-first-article.mdx
    └── de/                        # German translations
        └── my-first-article.mdx

public/
└── images/
    └── articles/
        ├── hero-image.webp
        └── inline-image.webp
```

### Locale Fallback

If a translation doesn't exist for a locale, the system automatically falls back to English. This means:
- You only need to translate articles you want to translate
- All articles are available in all locales (English fallback)
- The `locale` field in the article data shows which locale was actually used

---

## Generating Images

We use DALL-E 3 to generate kawaii/aesthetic images that match our brand.

### Setup (One-Time)

Add to `.env.local`:
```
OPENAI_API_KEY=sk-...
```

### Usage

```bash
# Generate image (~$0.08 per image)
npm run generate-image -- "kawaii prompt here" --name filename

# Examples
npm run generate-image -- "cute kawaii desk setup with pink accessories pastel colors" --name desk-hero
npm run generate-image -- "aesthetic study space cozy lighting soft colors" --name study-hero

# Convert to WebP for optimization (~95% smaller)
npm run webp -- public/images/articles --all
```

### Output

1. Image saved to `public/images/articles/{name}.png`
2. After WebP conversion: `public/images/articles/{name}.webp`
3. Use `.webp` extension in frontmatter

---

## MDX Features

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
- [ ] **Image**: Generated with DALL-E, converted to WebP
- [ ] **AI Score**: 90%+ human score
- [ ] **Word Count**: 1,500-2,500 words
- [ ] **Tags**: 3-5 relevant tags
- [ ] **Internal Links**: Link to app (`/`) or other articles

---

## Article Writing Tips

### Follow the SEO Plan

See `docs/SEO-PLAN.md` for the complete writing process and humanization rules.

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
- Is in `content/articles/en/` (or another locale folder)
- Has `.mdx` extension
- Has valid frontmatter with `published: true`

### Image not showing

1. Verify image exists in `public/images/articles/`
2. Check path starts with `/images/articles/`
3. Run `npm run build` to check for errors

### AI score too low

Review `docs/SEO-PLAN.md` Phase 3 (Humanization Rules) and:
- Add more personal anecdotes
- Use contractions throughout
- Vary sentence structure
- Add opinions and rhetorical questions

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run generate-image -- "prompt" --name filename` | Generate image with DALL-E 3 |
| `npm run webp -- public/images/articles --all` | Convert images to WebP |
| `npm run ai-check -- --file path/to/article.mdx` | Check AI detection score |
| `npm run dev` | Preview articles locally |
| `npm run build` | Build for production |
