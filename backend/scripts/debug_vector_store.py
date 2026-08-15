#!/usr/bin/env python3
"""Build the Chroma index from the existing chunks/embeddings and print a summary. Debug only."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.vector_store import build_index, get_collection


def main() -> None:
    chunks_stored = build_index()
    collection_count = get_collection().count()

    print(f"chunks_stored={chunks_stored}")
    print(f"collection_count={collection_count}")


if __name__ == "__main__":
    main()
