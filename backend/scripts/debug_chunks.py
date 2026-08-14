#!/usr/bin/env python3
"""Print chunking output for the sustainability knowledge base. Debug only."""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.chunking import DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE, chunk_documents


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chunk-size", type=int, default=DEFAULT_CHUNK_SIZE)
    parser.add_argument("--overlap", type=int, default=DEFAULT_CHUNK_OVERLAP)
    parser.add_argument("--preview-chars", type=int, default=80)
    args = parser.parse_args()

    chunks = chunk_documents(chunk_size=args.chunk_size, overlap=args.overlap)

    print(f"chunk_size={args.chunk_size} overlap={args.overlap}")
    print(f"total_chunks={len(chunks)}")
    print()

    for chunk in chunks:
        preview = chunk.text[: args.preview_chars].replace("\n", " ")
        print(f"[{chunk.source} #{chunk.index}] size={len(chunk.text)} preview={preview!r}")


if __name__ == "__main__":
    main()
