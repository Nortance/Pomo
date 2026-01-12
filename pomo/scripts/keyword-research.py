#!/usr/bin/env python3
"""
Free keyword research using Google Trends via pytrends.
No API key required.

Install: pip install pytrends pandas

Usage:
  python3 scripts/keyword-research.py                    # Default keywords
  python3 scripts/keyword-research.py "focus timer"      # Single keyword
  python3 scripts/keyword-research.py "pomodoro" "timer" # Multiple keywords
"""

import sys
import time

try:
    from pytrends.request import TrendReq
    import pandas as pd
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install pytrends pandas")
    sys.exit(1)


def research_keywords(keywords: list[str], timeframe: str = "today 12-m", geo: str = ""):
    """
    Research keywords using Google Trends.

    Args:
        keywords: List of 1-5 keywords to research
        timeframe: 'today 12-m', 'today 3-m', 'now 7-d', etc.
        geo: Country code ('US', 'GB', '') for worldwide
    """
    if len(keywords) > 5:
        print("Warning: Google Trends only supports up to 5 keywords. Using first 5.")
        keywords = keywords[:5]

    print(f"\n{'='*60}")
    print(f"KEYWORD RESEARCH: {', '.join(keywords)}")
    print(f"Timeframe: {timeframe} | Region: {geo or 'Worldwide'}")
    print(f"{'='*60}")

    # Initialize pytrends
    pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25))

    try:
        # Build payload
        pytrends.build_payload(keywords, timeframe=timeframe, geo=geo)

        # 1. Interest Over Time
        print("\n📈 INTEREST OVER TIME (Recent Months)")
        print("-" * 50)
        interest = pytrends.interest_over_time()
        if not interest.empty:
            # Show last 10 data points
            recent = interest.drop(columns=['isPartial'], errors='ignore').tail(10)
            print(recent.to_string())

            # Show average interest
            print("\nAverage Interest:")
            for kw in keywords:
                if kw in interest.columns:
                    print(f"  {kw}: {interest[kw].mean():.1f}")
        else:
            print("  No data available")

        time.sleep(1)  # Rate limiting

        # 2. Related Queries (Rising)
        print("\n🔍 RISING RELATED QUERIES")
        print("-" * 50)
        related = pytrends.related_queries()
        for kw in keywords:
            if kw in related and related[kw]['rising'] is not None:
                print(f"\n{kw}:")
                rising = related[kw]['rising'].head(10)
                for _, row in rising.iterrows():
                    print(f"  ↑ {row['query']} ({row['value']})")
            else:
                print(f"\n{kw}: No rising queries found")

        time.sleep(1)  # Rate limiting

        # 3. Related Queries (Top)
        print("\n🏆 TOP RELATED QUERIES")
        print("-" * 50)
        for kw in keywords:
            if kw in related and related[kw]['top'] is not None:
                print(f"\n{kw}:")
                top = related[kw]['top'].head(10)
                for _, row in top.iterrows():
                    print(f"  • {row['query']} ({row['value']})")
            else:
                print(f"\n{kw}: No top queries found")

        time.sleep(1)  # Rate limiting

        # 4. Keyword Suggestions (Autocomplete)
        print("\n💡 KEYWORD SUGGESTIONS (Google Autocomplete)")
        print("-" * 50)
        for kw in keywords:
            suggestions = pytrends.suggestions(kw)
            print(f"\n{kw}:")
            if suggestions:
                for s in suggestions[:8]:
                    print(f"  → {s['title']}")
            else:
                print("  No suggestions found")

        time.sleep(1)  # Rate limiting

        # 5. Interest by Region
        print("\n🌍 INTEREST BY REGION (Top 10 Countries)")
        print("-" * 50)
        region = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=False)
        if not region.empty:
            # Sum across all keywords and sort
            region['total'] = region.sum(axis=1)
            top_regions = region.nlargest(10, 'total')
            for idx, row in top_regions.iterrows():
                values = [f"{kw}: {row[kw]}" for kw in keywords if row[kw] > 0]
                if values:
                    print(f"  {idx}: {', '.join(values)}")
        else:
            print("  No regional data available")

    except Exception as e:
        print(f"\nError: {e}")
        print("\nTips:")
        print("  - Try fewer keywords (max 5)")
        print("  - Wait a few seconds and retry (rate limiting)")
        print("  - Check your internet connection")

    # Summary for content strategy
    print("\n" + "="*60)
    print("📝 CONTENT STRATEGY TAKEAWAYS")
    print("="*60)
    print("""
Use this data to:
1. Find rising queries to write about NOW
2. Identify top queries to include in pillar content
3. Use autocomplete suggestions as H2 headings
4. Target regions with highest interest

Run with different timeframes:
  'now 7-d'     - Last 7 days (trending NOW)
  'today 1-m'   - Last month
  'today 3-m'   - Last 3 months
  'today 12-m'  - Last year (default)
  'today 5-y'   - Last 5 years (long-term trends)
""")


def main():
    # Default keywords for CodeFocus
    default_keywords = [
        "pomodoro technique",
        "pomodoro timer",
        "focus timer",
        "productivity app"
    ]

    # Use command line args or defaults
    if len(sys.argv) > 1:
        keywords = sys.argv[1:]
    else:
        keywords = default_keywords
        print("Using default keywords. Pass custom keywords as arguments:")
        print(f'  python3 {sys.argv[0]} "your keyword" "another keyword"')

    research_keywords(keywords)


if __name__ == "__main__":
    main()
