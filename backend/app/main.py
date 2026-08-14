from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .document_loader import load_knowledge_text
from .gemini_client import ask_ecobot
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
    return ask_ecobot(request.message, _knowledge_text)
