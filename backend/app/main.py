from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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
from .report_submission import (
    CategoryNotFound,
    ReporterNotRegistered,
    create_issue,
    register_guest_reporter,
    upload_issue_media,
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


@app.post("/community/guest-id")
def create_guest_id():
    try:
        reporter_id = register_guest_reporter()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Could not create a guest identity") from exc
    return {"reporter_id": reporter_id}


@app.post("/community/issues")
async def submit_issue_endpoint(
    reporter_id: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    severity: str = Form("medium"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
):
    try:
        issue = create_issue(
            reporter_id=reporter_id,
            category=category,
            description=description,
            severity=severity,
            latitude=latitude,
            longitude=longitude,
            address=address,
            city=city,
            title=title,
        )
    except CategoryNotFound as exc:
        raise HTTPException(status_code=400, detail=f"Unknown category: {exc}") from exc
    except ReporterNotRegistered as exc:
        raise HTTPException(
            status_code=422, detail="Reporter is not registered; request a new guest id"
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Supabase is currently unavailable") from exc

    media_rows = []
    try:
        for index, file in enumerate(files):
            file_bytes = await file.read()
            media_rows.append(
                upload_issue_media(
                    issue_id=issue["id"],
                    uploaded_by=reporter_id,
                    index=index,
                    filename=file.filename or f"file-{index}",
                    file_bytes=file_bytes,
                    content_type=file.content_type,
                )
            )
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail=f"Issue was saved, but media upload failed: {exc}"
        ) from exc

    return {"issue": issue, "media": media_rows}


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
