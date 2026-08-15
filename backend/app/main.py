from typing import List

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .community_issues import fetch_active_issues, fetch_issue_by_id
from .document_loader import load_knowledge_text
from .gemini_client import ask_ecobot
from .local_responses import match_local_response
from .quest_generator import InvalidGeneratedQuest, generate_quest_for_issue, insert_quest
from .quest_participation import (
    AlreadyJoined,
    QuestNotAccepted,
    QuestNotFound,
    QuestNotStarted,
    QuestNotSubmitted,
    accept_quest,
    fetch_my_quests,
    start_quest,
    submit_quest,
    upload_quest_proof,
    verify_quest,
)
from .retrieval import format_retrieved_chunks, retrieve
from .schemas import ChatReply, ChatRequest, CommunityIssue, MyQuest

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


@app.get("/community/issues", response_model=List[CommunityIssue])
def community_issues():
    try:
        return fetch_active_issues()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc


@app.get("/quests/my", response_model=List[MyQuest])
def my_quests():
    try:
        return fetch_my_quests()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc


@app.post("/community/issues/{issue_id}/generate-quest")
def generate_quest(issue_id: str):
    try:
        issue = fetch_issue_by_id(issue_id)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc

    if issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")

    try:
        quest = generate_quest_for_issue(issue)
    except InvalidGeneratedQuest as exc:
        raise HTTPException(status_code=502, detail=f"Gemini returned an invalid quest: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Quest generation failed") from exc

    try:
        return insert_quest(quest)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Could not save the generated quest") from exc


@app.post("/quests/{quest_id}/accept")
def accept_quest_endpoint(quest_id: str):
    try:
        return accept_quest(quest_id)
    except QuestNotFound as exc:
        raise HTTPException(status_code=404, detail="Quest not found") from exc
    except AlreadyJoined as exc:
        raise HTTPException(status_code=409, detail="Already joined this quest") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc


@app.post("/quests/{quest_id}/start")
def start_quest_endpoint(quest_id: str):
    try:
        return start_quest(quest_id)
    except QuestNotAccepted as exc:
        raise HTTPException(status_code=404, detail="Quest not accepted yet") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc


@app.post("/quests/{quest_id}/submit")
def submit_quest_endpoint(quest_id: str):
    try:
        return submit_quest(quest_id)
    except QuestNotFound as exc:
        raise HTTPException(status_code=404, detail="Quest not found") from exc
    except QuestNotStarted as exc:
        raise HTTPException(status_code=409, detail="Quest must be in progress before submitting") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc


@app.post("/quests/{quest_id}/proof")
async def upload_quest_proof_endpoint(quest_id: str, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        return upload_quest_proof(quest_id, file.filename, file_bytes, file.content_type)
    except QuestNotFound as exc:
        raise HTTPException(status_code=404, detail="Quest not found") from exc
    except QuestNotStarted as exc:
        raise HTTPException(status_code=409, detail="Quest must be in progress before uploading proof") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc


@app.post("/quests/{quest_id}/verify")
def verify_quest_endpoint(quest_id: str):
    try:
        return verify_quest(quest_id)
    except QuestNotFound as exc:
        raise HTTPException(status_code=404, detail="Quest not found") from exc
    except QuestNotSubmitted as exc:
        raise HTTPException(status_code=409, detail="Quest must be submitted before verifying") from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc
