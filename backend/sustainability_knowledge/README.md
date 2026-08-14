# Sustainability knowledge base

Place EcoBot reference material in this directory. Supported formats are PDF,
DOCX, and TXT.

The index builder extracts each document, splits it into overlapping chunks,
creates `all-MiniLM-L6-v2` embeddings, and stores them in the persistent Chroma
collection at `backend/chroma_db/`. At chat time, the most relevant chunks are
added to Gemini's context so answers stay grounded in the supplied sources.

After adding or changing documents, rebuild the index from `backend/`:

```powershell
.\venv\Scripts\python.exe scripts\debug_vector_store.py
```

The local JSON-backed responses for common questions work even when this
directory has no reference documents.
