from typing import List, Optional

from pydantic import BaseModel


class Quest(BaseModel):
    title: str
    description: str


class ChatReply(BaseModel):
    answer: str
    quests: List[Quest]


class ChatRequest(BaseModel):
    message: str


class CommunityIssue(BaseModel):
    id: str
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    status: str
    severity: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    created_at: Optional[str] = None


class GeneratedQuest(BaseModel):
    title: str
    description: str
    quest_type: str
    status: str = "active"
    points_reward: int
    community_id: str
