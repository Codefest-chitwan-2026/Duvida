from typing import List

from pydantic import BaseModel


class Quest(BaseModel):
    title: str
    description: str


class ChatReply(BaseModel):
    answer: str
    quests: List[Quest]


class ChatRequest(BaseModel):
    message: str
