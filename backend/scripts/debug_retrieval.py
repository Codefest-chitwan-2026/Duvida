#!/usr/bin/env python3
"""Test semantic retrieval against the existing Chroma index. Debug only."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.retrieval import retrieve

TEST_QUERIES = [
    "How can I save water at home?",
    "What are the challenges in waste management?",
    "What are the goals of the 2030 Agenda for Sustainable Development?",
]


def main() -> None:
    for query in TEST_QUERIES:
        print(f"query: {query!r}")
        results = retrieve(query, top_k=5)
        for rank, chunk in enumerate(results, start=1):
            preview = chunk["text"][:80].replace("\n", " ")
            print(
                f"  #{rank} source={chunk['source']} chunk_index={chunk['chunk_index']} "
                f"distance={chunk['distance']:.4f}"
            )
            print(f"      preview={preview!r}")
        print()


if __name__ == "__main__":
    main()
