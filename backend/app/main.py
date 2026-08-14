from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .document_loader import load_knowledge_text
from .gemini_client import ask_ecobot
from .local_responses import match_local_response
from .retrieval import format_retrieved_chunks, retrieve
from .schemas import ChatReply, ChatRequest

app = FastAPI(title="Sustainability Advisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_knowledge_text = load_knowledge_text()


@app.get("/health")
def health():
    return {"status": "ok", "knowledge_chars": len(_knowledge_text)}


@app.post("/chat", response_model=ChatReply)
def chat(request: ChatRequest):
    local_reply = match_local_response(request.message)
    if local_reply is not None:
        return local_reply

    retrieved_chunks = retrieve(request.message, top_k=5)
    knowledge = format_retrieved_chunks(retrieved_chunks)
    return ask_ecobot(request.message, knowledge)
