from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .document_loader import load_knowledge_text
from .gemini_client import ask_ecobot
from .retrieval import format_retrieved_chunks, retrieve
from .schemas import ChatReply, ChatRequest
from .vector_store import build_index, get_collection

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI):
    build_index()
    yield


app = FastAPI(title="Sustainability Advisor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "knowledge_chars": len(load_knowledge_text()),
        "indexed_chunks": get_collection().count(),
    }


@app.post("/chat", response_model=ChatReply)
def chat(request: ChatRequest):
    knowledge = format_retrieved_chunks(retrieve(request.message, top_k=5))
    return ask_ecobot(request.message, knowledge)
