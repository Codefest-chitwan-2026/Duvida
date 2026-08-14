"""Deterministic, offline answers for simple/common questions — no Gemini call.

Covers quick tips and SDG 11/12/13 explainers. Anything that doesn't match one
of these trigger phrases falls through to the RAG -> Gemini flow in main.py.
To extend: add a new _Rule with its trigger phrases and a canned reply.
"""

from typing import List, NamedTuple, Optional, TypedDict


class _Quest(TypedDict):
    title: str
    description: str


class _Reply(TypedDict):
    answer: str
    quests: List[_Quest]


class _Rule(NamedTuple):
    triggers: List[str]
    reply: _Reply


_RULES: List[_Rule] = [
    _Rule(
        triggers=["what is sdg 11", "sdg 11", "sustainable cities and communities"],
        reply={
            "answer": (
                "SDG 11 is 'Sustainable Cities and Communities' — it's about making cities "
                "and human settlements inclusive, safe, resilient, and sustainable, covering "
                "things like affordable housing, safe public transport, and green public spaces."
            ),
            "quests": [],
        },
    ),
    _Rule(
        triggers=["what is sdg 12", "sdg 12", "responsible consumption and production"],
        reply={
            "answer": (
                "SDG 12 is 'Responsible Consumption and Production' — it's about using "
                "resources efficiently, reducing waste, and encouraging sustainable practices "
                "in how goods are produced and consumed."
            ),
            "quests": [],
        },
    ),
    _Rule(
        triggers=["what is sdg 13", "sdg 13", "climate action goal"],
        reply={
            "answer": (
                "SDG 13 is 'Climate Action' — it calls for urgent action to combat climate "
                "change and its impacts, including strengthening resilience to climate-related "
                "hazards and integrating climate measures into policy."
            ),
            "quests": [],
        },
    ),
    _Rule(
        triggers=[
            "water tip",
            "water-saving tip",
            "water saving tip",
            "save water",
            "saving water",
            "conserve water",
            "water conservation",
            "how can i save water",
            "how to save water",
        ],
        reply={
            "answer": (
                "Simple ways to save water: take shorter showers, fix leaking taps and pipes "
                "promptly, turn off the tap while brushing your teeth, and reuse water where "
                "you can (e.g. for plants). Every drop adds up!"
            ),
            "quests": [
                {
                    "title": "Leak Check",
                    "description": "Inspect your home's taps and pipes for leaks and fix any you find.",
                },
                {
                    "title": "Shorter Showers",
                    "description": "Keep your showers under 5 minutes for a week.",
                },
            ],
        },
    ),
    _Rule(
        triggers=[
            "waste tip",
            "recycling tip",
            "recycle tip",
            "reduce waste",
            "waste management tip",
            "how to recycle",
            "how can i recycle",
        ],
        reply={
            "answer": (
                "Cut down waste with the 3 Rs: reduce what you buy, reuse items when possible, "
                "and recycle materials like paper, plastic, and glass properly. Composting food "
                "scraps helps too."
            ),
            "quests": [
                {
                    "title": "Sort Your Waste",
                    "description": "Separate recyclables from general waste at home for one week.",
                },
                {
                    "title": "Start Composting",
                    "description": "Set up a small compost bin for fruit and vegetable scraps.",
                },
            ],
        },
    ),
    _Rule(
        triggers=[
            "energy tip",
            "save energy",
            "saving energy",
            "reduce energy",
            "energy saving",
            "conserve energy",
            "how to save energy",
            "how can i save energy",
        ],
        reply={
            "answer": (
                "Reduce energy use by turning off lights and unplugging devices when not in "
                "use, switching to energy-efficient bulbs, and using natural light during the day."
            ),
            "quests": [
                {
                    "title": "Unplug Challenge",
                    "description": "Unplug devices you're not using for a full day and notice the difference.",
                },
                {
                    "title": "Switch to LEDs",
                    "description": "Replace one old bulb at home with an energy-efficient LED.",
                },
            ],
        },
    ),
    _Rule(
        triggers=[
            "transport tip",
            "sustainable transport",
            "eco-friendly transport",
            "green transport",
            "low carbon transport",
            "low-carbon transport",
            "how to travel sustainably",
        ],
        reply={
            "answer": (
                "Choose sustainable transport when you can: walk or cycle for short trips, use "
                "public transport, or carpool. These options cut down on emissions compared to "
                "driving alone."
            ),
            "quests": [
                {
                    "title": "Car-Free Day",
                    "description": "Walk, cycle, or use public transport instead of a private vehicle for one day.",
                },
                {
                    "title": "Carpool Once",
                    "description": "Share a ride with someone instead of traveling separately.",
                },
            ],
        },
    ),
    _Rule(
        triggers=[
            "greenery tip",
            "plant a tree",
            "planting trees",
            "green space tip",
            "community garden",
            "tree planting tip",
        ],
        reply={
            "answer": (
                "Support greenery by planting native trees or starting a small garden, caring "
                "for existing green spaces near you, and joining or organizing a local "
                "tree-planting drive."
            ),
            "quests": [
                {
                    "title": "Plant Something",
                    "description": "Plant a tree, shrub, or a few seeds in your yard or a community space.",
                },
                {
                    "title": "Green Space Cleanup",
                    "description": "Spend 30 minutes tidying up a park or green space near you.",
                },
            ],
        },
    ),
    _Rule(
        triggers=[
            "suggest a quest",
            "quest suggestion",
            "give me a quest",
            "recommend a quest",
            "quest idea",
        ],
        reply={
            "answer": (
                "Here's a quest you can try right now — small actions add up to real community impact!"
            ),
            "quests": [
                {
                    "title": "Weekly Eco Check-In",
                    "description": "Pick one habit (water, waste, or energy) and track your improvement for 7 days.",
                }
            ],
        },
    ),
]


def match_local_response(message: str) -> Optional[_Reply]:
    """Return a canned reply if the message matches a simple/common pattern, else None."""
    lowered = message.lower()
    for rule in _RULES:
        if any(trigger in lowered for trigger in rule.triggers):
            return rule.reply
    return None
