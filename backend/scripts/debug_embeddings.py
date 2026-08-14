#!/usr/bin/env python3
"""Embed the existing chunks and print a sanity summary. Debug only."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.chunking import chunk_documents
from app.embeddings import embed_texts


def main() -> None:
    chunks = chunk_documents()
    texts = [chunk.text for chunk in chunks]

    embeddings = embed_texts(texts)

    print(f"num_chunks_embedded={len(embeddings)}")
    if embeddings:
        print(f"embedding_dimension={len(embeddings[0])}")
        print(f"first_embedding_preview={embeddings[0][:5]}")


if __name__ == "__main__":
    main()
