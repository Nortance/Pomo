# Scripts Setup Guide

## Overview

This directory contains utility scripts for:
- **AI Detection** - Check content for AI-generated patterns
- **Image Fetching** - Download Unsplash images with attribution

---

# AI Detection Scripts Setup

## Prerequisites

Install pip if not already available:

```bash
# Ubuntu/Debian
sudo apt install python3-pip

# macOS
python3 -m ensurepip --upgrade

# Windows
python -m ensurepip --upgrade
```

## Install Dependencies

```bash
pip3 install thinkst-zippy transformers torch
```

**Note:** First run of RoBERTa will download ~500MB model. No API keys needed.

## Usage

### Basic Usage

```bash
# Analyze text directly
python3 scripts/ai-detector.py "Your article text here..."

# Analyze a file
python3 scripts/ai-detector.py --file articles/pomodoro-guide.md

# Read from stdin
cat article.md | python3 scripts/ai-detector.py --stdin

# Quiet mode (just the score)
python3 scripts/ai-detector.py --file article.md --quiet
```

### Score Interpretation

| Human Score | Verdict | Action |
|-------------|---------|--------|
| **90-100%** | **PASS** | Safe to publish |
| 75-89% | CLOSE | Minor tweaks needed |
| 60-74% | REVISE | Significant revision needed |
| 0-59% | FAIL | Major rewrite needed |

**Target: 90%+ for Google SEO safety**

### Iteration Workflow

For SEO articles, run detection after each revision:

```bash
# First draft
python3 scripts/ai-detector.py --file articles/draft-v1.md

# After edits
python3 scripts/ai-detector.py --file articles/draft-v2.md

# Final check
python3 scripts/ai-detector.py --file articles/draft-v3.md
```

## Tips to Reduce AI Detection

1. **Add personal anecdotes** - "When I first tried the Pomodoro technique..."
2. **Use varied sentence structures** - Mix short and long sentences
3. **Include specific data** - "In my experience, 23-minute sessions work better than 25"
4. **Add colloquialisms** - Natural speech patterns
5. **Break predictable patterns** - AI tends to be very structured
6. **Insert opinions** - "Honestly, I think..."
7. **Reference current events** - Makes content feel timely

## How It Works

### Zippy (Compression-based)
Uses the principle that AI text compresses more efficiently than human text due to predictable patterns. Fast, no GPU needed.

### RoBERTa (Neural Network)
Fine-tuned transformer model trained to distinguish human vs AI text. More accurate but slower.

Both methods combined give a reliable signal for content that might be flagged by Google or readers as AI-generated.
