#!/usr/bin/env python3
"""
AI Content Detection Script for CodeFocus SEO Articles

Uses two detection methods:
1. Zippy - Compression-based detection (fast, no GPU)
2. RoBERTa - Neural network classifier (more accurate)

Usage:
    python3 scripts/ai-detector.py "Your text content here"
    python3 scripts/ai-detector.py --file articles/my-article.md
    cat article.md | python3 scripts/ai-detector.py --stdin

Install dependencies:
    pip3 install thinkst-zippy transformers torch

No API keys required - runs fully locally.
"""

import sys
import argparse
from pathlib import Path

# Scores interpretation:
# - Human score > 0.7: Likely human-written, good to publish
# - Human score 0.5-0.7: Mixed signals, consider revising
# - Human score < 0.5: Likely AI-detected, needs significant revision

def check_dependencies():
    """Check if required packages are installed."""
    missing = []

    try:
        import zippy
    except ImportError:
        missing.append("thinkst-zippy")

    try:
        import transformers
    except ImportError:
        missing.append("transformers")

    try:
        import torch
    except ImportError:
        missing.append("torch")

    if missing:
        print("Missing dependencies. Install with:")
        print(f"  pip3 install {' '.join(missing)}")
        sys.exit(1)


def detect_with_zippy(text: str) -> dict:
    """
    Detect AI content using Zippy (compression-based).
    Fast, no GPU required.
    """
    from zippy import Zippy

    z = Zippy()
    result = z.run_on_text_chunked(text)

    # result is tuple: ('Human'|'AI', score)
    # score is confidence in that label
    label, confidence = result

    # Convert to human_score (0-1 where 1 = definitely human)
    if label == "Human":
        human_score = confidence
    else:
        human_score = 1 - confidence

    return {
        "method": "Zippy (compression)",
        "label": label,
        "human_score": round(human_score, 3),
        "ai_score": round(1 - human_score, 3),
        "raw_confidence": round(confidence, 3)
    }


def detect_with_roberta(text: str) -> dict:
    """
    Detect AI content using RoBERTa OpenAI detector.
    More accurate but requires model download (~500MB first run).
    """
    from transformers import pipeline

    # Suppress warnings
    import warnings
    warnings.filterwarnings("ignore")

    detector = pipeline(
        "text-classification",
        model="openai-community/roberta-base-openai-detector",
        device=-1,  # CPU, use 0 for GPU
        truncation=True,
        max_length=512
    )

    # RoBERTa has max 512 tokens, chunk and analyze
    max_chars = 1500  # ~375 tokens to be safe
    chunks = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]

    # Analyze all chunks and average
    human_scores = []
    for chunk in chunks:
        if len(chunk.strip()) < 50:
            continue  # Skip very short chunks
        result = detector(chunk)[0]
        if result['label'] == 'Real':
            human_scores.append(result['score'])
        else:
            human_scores.append(1 - result['score'])

    if not human_scores:
        raise ValueError("No valid chunks to analyze")

    avg_human = sum(human_scores) / len(human_scores)

    return {
        "method": "RoBERTa (neural)",
        "label": "Human" if avg_human > 0.5 else "AI",
        "human_score": round(avg_human, 3),
        "ai_score": round(1 - avg_human, 3),
    }


def analyze_text(text: str, verbose: bool = True) -> dict:
    """Run both detectors and return combined analysis."""

    if len(text.strip()) < 100:
        print("Warning: Text is very short. Results may be unreliable.")
        print("Recommend at least 250+ words for accurate detection.\n")

    results = {}

    # Run Zippy
    if verbose:
        print("Running Zippy (compression-based)...")
    try:
        results['zippy'] = detect_with_zippy(text)
    except Exception as e:
        results['zippy'] = {"error": str(e)}

    # Run RoBERTa
    if verbose:
        print("Running RoBERTa (neural network)...")
    try:
        results['roberta'] = detect_with_roberta(text)
    except Exception as e:
        results['roberta'] = {"error": str(e)}

    # Calculate combined score
    # RoBERTa is weighted higher (70%) because:
    # - It's trained specifically on AI-generated text detection
    # - Zippy (compression-based) falsely flags structured content like listicles
    zippy_score = results.get('zippy', {}).get('human_score')
    roberta_score = results.get('roberta', {}).get('human_score')

    # Check if content is a listicle (structured content)
    is_listicle = is_listicle_content(text)

    if roberta_score is not None and zippy_score is not None:
        # Weighted average: 70% RoBERTa, 30% Zippy
        avg_human = (roberta_score * 0.7) + (zippy_score * 0.3)
        results['combined'] = {
            "human_score": round(avg_human, 3),
            "ai_score": round(1 - avg_human, 3),
            "verdict": get_verdict(avg_human, roberta_score, is_listicle),
            "note": "Weighted 70% RoBERTa, 30% Zippy" + (" (listicle detected)" if is_listicle else "")
        }
    elif roberta_score is not None:
        results['combined'] = {
            "human_score": round(roberta_score, 3),
            "ai_score": round(1 - roberta_score, 3),
            "verdict": get_verdict(roberta_score, roberta_score, is_listicle),
            "note": "RoBERTa only (Zippy failed)"
        }
    elif zippy_score is not None:
        results['combined'] = {
            "human_score": round(zippy_score, 3),
            "ai_score": round(1 - zippy_score, 3),
            "verdict": get_verdict(zippy_score),
            "note": "Zippy only (RoBERTa failed)"
        }

    return results


def get_verdict(human_score: float, roberta_score: float = None, is_listicle: bool = False) -> str:
    """Get human-readable verdict based on score."""
    # For listicles: if RoBERTa (neural) passes, trust it over Zippy (compression)
    # Zippy falsely flags structured content due to compression patterns
    if is_listicle and roberta_score is not None and roberta_score >= 0.9:
        return "PASS - RoBERTa confirms human-written (Zippy unreliable for listicles)"

    if human_score >= 0.9:
        return "PASS - Appears human-written, safe to publish"
    elif human_score >= 0.75:
        return "CLOSE - Almost there, minor tweaks needed"
    elif human_score >= 0.6:
        return "REVISE - AI signals detected, revision needed"
    else:
        return "FAIL - Strongly detected as AI, major rewrite needed"


def is_listicle_content(text: str) -> bool:
    """Detect if content is a listicle (numbered headers, etc.)"""
    import re
    # Look for patterns like "## 1." or "## 2." or "# 1." etc.
    listicle_pattern = r'^#{1,3}\s*\d+[\.\):]'
    matches = re.findall(listicle_pattern, text, re.MULTILINE)
    return len(matches) >= 3  # At least 3 numbered sections


def print_results(results: dict, text: str):
    """Pretty print the analysis results."""
    word_count = len(text.split())

    print("\n" + "=" * 60)
    print("AI CONTENT DETECTION RESULTS")
    print("=" * 60)
    print(f"Text length: {len(text)} chars, ~{word_count} words\n")

    for method, data in results.items():
        if method == 'combined':
            continue
        if 'error' in data:
            print(f"{data.get('method', method)}: ERROR - {data['error']}")
        else:
            status = "HUMAN" if data['human_score'] > 0.5 else "AI"
            print(f"{data['method']}:")
            print(f"  Detection: {status}")
            print(f"  Human score: {data['human_score']:.1%}")
            print(f"  AI score: {data['ai_score']:.1%}")
        print()

    if 'combined' in results:
        print("-" * 60)
        print("COMBINED ANALYSIS:")
        print(f"  Human score: {results['combined']['human_score']:.1%}")
        print(f"  AI score: {results['combined']['ai_score']:.1%}")
        print(f"  Verdict: {results['combined']['verdict']}")

    print("=" * 60)

    # Recommendations
    if 'combined' in results:
        score = results['combined']['human_score']
        print("\nRECOMMENDATIONS:")
        if score < 0.6:
            print("- Add personal anecdotes: 'When I first tried...'")
            print("- Use contractions: don't, can't, won't")
            print("- Add rhetorical questions: 'Ever felt overwhelmed?'")
            print("- Include specific numbers: '23 minutes' not 'about 25'")
            print("- Add opinions: 'Honestly, I think...'")
            print("- Use informal transitions: 'Here's the thing...'")
            print("- Break predictable list patterns")
        elif score < 0.75:
            print("- Add 2-3 personal anecdotes")
            print("- Vary sentence length more dramatically")
            print("- Include a controversial or unique opinion")
            print("- Add specific real-world examples")
        elif score < 0.9:
            print("- Almost there! Add one more personal touch")
            print("- Consider a unique metaphor or analogy")
            print("- Review intro/conclusion for natural voice")
        else:
            print("- Content appears natural, ready for review")


def main():
    parser = argparse.ArgumentParser(
        description="Detect AI-generated content using Zippy and RoBERTa"
    )
    parser.add_argument("text", nargs="?", help="Text to analyze")
    parser.add_argument("--file", "-f", help="Read text from file")
    parser.add_argument("--stdin", "-s", action="store_true", help="Read from stdin")
    parser.add_argument("--quiet", "-q", action="store_true", help="Only output scores")

    args = parser.parse_args()

    # Check dependencies first
    check_dependencies()

    # Get text from appropriate source
    if args.stdin:
        text = sys.stdin.read()
    elif args.file:
        path = Path(args.file)
        if not path.exists():
            print(f"Error: File not found: {args.file}")
            sys.exit(1)
        text = path.read_text()
    elif args.text:
        text = args.text
    else:
        parser.print_help()
        sys.exit(1)

    # Run analysis
    results = analyze_text(text, verbose=not args.quiet)

    # Print results
    if args.quiet:
        if 'combined' in results:
            print(f"{results['combined']['human_score']:.3f}")
    else:
        print_results(results, text)

    # Exit code based on verdict (PASS = success)
    if 'combined' in results:
        verdict = results['combined'].get('verdict', '')
        if verdict.startswith('PASS'):
            sys.exit(0)  # Pass
        else:
            sys.exit(1)  # Needs revision


if __name__ == "__main__":
    main()
