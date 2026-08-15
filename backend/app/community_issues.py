from typing import List, Optional

from .supabase_client import get_client

_FIELDS = "id,title,description,category_id,status,severity,latitude,longitude,address,city,created_at"

# Same fields, plus the category name embedded via the issue_categories FK —
# used only for quest generation, which needs a readable category for its
# retrieval query. Kept separate so the existing /community/issues response
# shape (_FIELDS above) is untouched.
_FIELDS_WITH_CATEGORY = _FIELDS + ",issue_categories(name)"

# Best-effort guess at "completed" status values — the issues table is
# currently empty on this project, so this couldn't be verified against
# real data. Adjust here if the actual status values differ.
_COMPLETED_STATUSES = ["resolved", "closed"]


def fetch_active_issues() -> List[dict]:
    """Active, non-deleted issues. Raises on a Supabase-side failure."""
    response = (
        get_client()
        .table("issues")
        .select(_FIELDS)
        .is_("deleted_at", "null")
        .not_.in_("status", _COMPLETED_STATUSES)
        .execute()
    )
    return response.data


def fetch_issue_by_id(issue_id: str) -> Optional[dict]:
    """A single non-deleted issue with its category name embedded, or None."""
    response = (
        get_client()
        .table("issues")
        .select(_FIELDS_WITH_CATEGORY)
        .eq("id", issue_id)
        .is_("deleted_at", "null")
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None
