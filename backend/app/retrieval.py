from typing import List, TypedDict

from .embeddings import embed_texts
from .vector_store import get_collection


class RetrievedChunk(TypedDict):
    source: str
    chunk_index: int
    text: str
    distance: float


def retrieve(query: str, top_k: int = 5) -> List[RetrievedChunk]:
    if not query.strip():
        return []

    query_embedding = embed_texts([query])[0]
    collection = get_collection()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    documents = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    return [
        {
            "source": metadata["source"],
            "chunk_index": metadata["chunk_index"],
            "text": text,
            "distance": distance,
        }
        for text, metadata, distance in zip(documents, metadatas, distances)
    ]


def format_retrieved_chunks(chunks: List[RetrievedChunk]) -> str:
    """Render retrieved chunks as a knowledge string, source metadata included."""
    return "\n\n".join(
        f"[Source: {chunk['source']}, chunk {chunk['chunk_index']}]\n{chunk['text']}"
        for chunk in chunks
    )
