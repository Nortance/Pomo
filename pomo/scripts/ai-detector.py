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
    result = z.classify(text)

    # result is tuple: ('Human', score) or ('AI', score)
    label, confidence = result
    human_score = 1 - confidence if label == "AI" else confidence

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
        device=-1  # CPU, use 0 for GPU
    )

    # RoBERTa has max 512 tokens, chunk if needed
    max_chars = 2000  # ~500 tokens
    if len(text) > max_chars:
        # Analyze multiple chunks and average
        chunks = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
        results = detector(chunks)

        # Average the scores
        human_scores = []
        for r in results:
            if r['label'] == 'Real':
                human_scores.append(r['score'])
            else:
                human_scores.append(1 - r['score'])

        avg_human = sum(human_scores) / len(human_scores)
    else:
        result = detector(text)[0]
        avg_human = result['score'] if result['label'] == 'Real' else 1 - result['score']

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

    # Calculate combined score (average of both)
    scores = []
    if 'human_score' in results.get('zippy', {}):
        scores.append(results['zippy']['human_score'])
    if 'human_score' in results.get('roberta', {}):
        scores.append(results['roberta']['human_score'])

    if scores:
        avg_human = sum(scores) / len(scores)
        results['combined'] = {
            "human_score": round(avg_human, 3),
            "ai_score": round(1 - avg_human, 3),
            "verdict": get_verdict(avg_human)
        }

    return results


def get_verdict(human_score: float) -> str:
    """Get human-readable verdict based on score."""
    if human_score >= 0.9:
        return "PASS - Appears human-written, safe to publish"
    elif human_score >= 0.75:
        return "CLOSE - Almost there, minor tweaks needed"
    elif human_score >= 0.6:
        return "REVISE - AI signals detected, revision needed"
    else:
        return "FAIL - Strongly detected as AI, major rewrite needed"


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

    # Exit code based on result (90% threshold for Google)
    if 'combined' in results:
        if results['combined']['human_score'] >= 0.9:
            sys.exit(0)  # Pass
        else:
            sys.exit(1)  # Needs revision


if __name__ == "__main__":
    main()
