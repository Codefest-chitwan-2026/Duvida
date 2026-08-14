import pathlib

import chromadb

from .chunking import chunk_documents
from .embeddings import embed_texts

PERSIST_DIR = pathlib.Path(__file__).resolve().parent.parent / "chroma_db"
COLLECTION_NAME = "sustainability_knowledge"

_client: chromadb.ClientAPI | None = None


def get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=str(PERSIST_DIR))
    return _client


def get_collection():
    return get_client().get_or_create_collection(name=COLLECTION_NAME)


def build_index() -> int:
    chunks = chunk_documents()
    client = get_client()

    try:
        client.delete_collection(name=COLLECTION_NAME)
    except Exception:
        pass

    collection = client.get_or_create_collection(name=COLLECTION_NAME)
    if not chunks:
        return 0

    texts = [chunk.text for chunk in chunks]
    collection.add(
        ids=[f"{chunk.source}::{chunk.index}" for chunk in chunks],
        embeddings=embed_texts(texts),
        documents=texts,
        metadatas=[{"source": chunk.source, "chunk_index": chunk.index} for chunk in chunks],
    )
    return len(chunks)
