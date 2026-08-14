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

    collection = get_collection()
    result_count = min(top_k, collection.count())
    if result_count == 0:
        return []

    results = collection.query(
        query_embeddings=[embed_texts([query])[0]],
        n_results=result_count,
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
    return "\n\n".join(
        f"[Source: {chunk['source']}, chunk {chunk['chunk_index']}]\n{chunk['text']}"
        for chunk in chunks
    )
