from typing import List

from .supabase_client import get_client

_FIELDS = "id,title,description,category_id,status,severity,latitude,longitude,address,city,created_at"

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
