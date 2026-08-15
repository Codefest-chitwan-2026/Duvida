#!/usr/bin/env python3
"""Create the Supabase client and confirm connectivity. Debug only.

Hits the PostgREST root endpoint only (no table queries, no data access).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
from dotenv import load_dotenv

load_dotenv()

from app.supabase_client import get_client


def main() -> None:
    try:
        client = get_client()
    except KeyError as exc:
        print(f"FAILURE: missing environment variable {exc}")
        return
    except Exception as exc:
        print(f"FAILURE: could not create Supabase client ({exc})")
        return

    print(f"Client created for {client.supabase_url}")

    try:
        response = httpx.get(str(client.rest_url), headers={"apikey": client.supabase_key}, timeout=10)
        print(f"SUCCESS: reached Supabase (status {response.status_code})")
    except Exception as exc:
        print(f"FAILURE: could not reach Supabase ({exc})")


if __name__ == "__main__":
    main()
