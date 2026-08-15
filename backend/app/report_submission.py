import uuid
from typing import Optional

from .supabase_client import get_client

MEDIA_BUCKET = "issue-media"

# The mobile report form's category ids don't all match issue_categories.slug
# 1:1 (its "water" option maps to the DB's "water_leak" slug). Everything else
# already matches.
_CATEGORY_SLUG_MAP = {
    "pothole": "pothole",
    "streetlight": "streetlight",
    "garbage": "garbage",
    "traffic": "traffic",
    "water": "water_leak",
    "other": "other",
}

TITLE_MAX_LENGTH = 80


class CategoryNotFound(Exception):
    pass


class ReporterNotRegistered(Exception):
    """reporter_id has no matching profiles/auth.users row (e.g. a stale
    guest id left over from before a database reset)."""


def register_guest_reporter() -> str:
    """Mint a new guest identity and return its id.

    There's no real signup for guests, so this creates a real auth.users row
    with a synthetic, never-emailed address — a database trigger on this
    project creates the matching profiles row automatically. issues.reporter_id
    has an enforced FK to profiles.id, so a real row has to exist there before
    any issue can reference it.
    """
    guest_uuid = uuid.uuid4()
    response = get_client().auth.admin.create_user(
        {
            "email": f"guest-{guest_uuid}@guest.duvida.local",
            "email_confirm": True,
            "user_metadata": {"is_guest": True},
        }
    )
    return response.user.id


def resolve_category_id(app_category: str) -> str:
    slug = _CATEGORY_SLUG_MAP.get(app_category, app_category)
    response = (
        get_client().table("issue_categories").select("id").eq("slug", slug).limit(1).execute()
    )
    if not response.data:
        raise CategoryNotFound(app_category)
    return response.data[0]["id"]


def derive_title(description: str, category: str) -> str:
    """The report form has no title field, so synthesize one from the
    description — the first line, capped to a reasonable length."""
    description = (description or "").strip()
    if not description:
        return f"New {category} report"
    first_line = description.splitlines()[0].strip()
    if len(first_line) <= TITLE_MAX_LENGTH:
        return first_line
    return first_line[: TITLE_MAX_LENGTH - 1].rstrip() + "…"


def create_issue(
    *,
    reporter_id: str,
    category: str,
    description: str,
    severity: str,
    latitude: float,
    longitude: float,
    address: Optional[str] = None,
    city: Optional[str] = None,
    title: Optional[str] = None,
) -> dict:
    category_id = resolve_category_id(category)

    row = {
        "reporter_id": reporter_id,
        "category_id": category_id,
        "title": title or derive_title(description, category),
        "description": description,
        "severity": severity,
        "status": "submitted",
        "location": f"POINT({longitude} {latitude})",
        "address": address,
        "city": city,
    }
    try:
        response = get_client().table("issues").insert(row).execute()
    except Exception as exc:
        if "reporter_id" in str(exc):
            raise ReporterNotRegistered(reporter_id) from exc
        raise
    return response.data[0]


def upload_issue_media(
    *,
    issue_id: str,
    uploaded_by: str,
    index: int,
    filename: str,
    file_bytes: bytes,
    content_type: Optional[str],
) -> dict:
    media_type = "video" if (content_type or "").startswith("video") else "image"
    storage_path = f"{issue_id}/{index}-{filename}"
    file_options = {"content-type": content_type} if content_type else None
    get_client().storage.from_(MEDIA_BUCKET).upload(storage_path, file_bytes, file_options)

    row = {
        "issue_id": issue_id,
        "uploaded_by": uploaded_by,
        "media_type": media_type,
        "storage_path": storage_path,
    }
    response = get_client().table("issue_media").insert(row).execute()
    return response.data[0]
