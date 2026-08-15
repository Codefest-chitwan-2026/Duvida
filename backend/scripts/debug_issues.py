#!/usr/bin/env python3
"""Fetch active community issues from Supabase and print the count. Debug only."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv()

from app.community_issues import fetch_active_issues


def main() -> None:
    try:
        issues = fetch_active_issues()
    except Exception as exc:
        print(f"FAILURE: could not fetch issues ({exc})")
        return

    print(f"SUCCESS: fetched {len(issues)} active issue(s)")


if __name__ == "__main__":
    main()
