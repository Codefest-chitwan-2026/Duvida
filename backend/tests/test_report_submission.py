import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.report_submission import (
    CategoryNotFound,
    ReporterNotRegistered,
    create_issue,
    derive_title,
    register_guest_reporter,
    resolve_category_id,
    upload_issue_media,
)

client = TestClient(app)

REPORTER_ID = "6b687749-e6cf-47db-a2ca-019a6b6cda46"
ISSUE_ID = "c1c2fc89-7464-419a-80d2-caa7aee889f4"
CATEGORY_ID = "c3c85c54-1650-448a-b25a-fc1b46b17828"


def _mock_supabase_client(*, category_rows=None, inserted_issue=None, inserted_media=None):
    categories_table = MagicMock()
    issues_table = MagicMock()
    media_table = MagicMock()

    mock_client = MagicMock()
    mock_client.table.side_effect = lambda name: {
        "issue_categories": categories_table,
        "issues": issues_table,
        "issue_media": media_table,
    }[name]
    mock_client.storage.from_.return_value = MagicMock()

    categories_table.select.return_value.eq.return_value.limit.return_value.execute.return_value.data = (
        category_rows if category_rows is not None else [{"id": CATEGORY_ID}]
    )
    issues_table.insert.return_value.execute.return_value.data = (
        [inserted_issue] if inserted_issue else []
    )
    media_table.insert.return_value.execute.return_value.data = (
        [inserted_media] if inserted_media else []
    )

    return mock_client, categories_table, issues_table, media_table


def test_derive_title_uses_first_line_of_description():
    assert derive_title("Garbage near the park entrance.\nMore detail.", "garbage") == (
        "Garbage near the park entrance."
    )


def test_derive_title_falls_back_when_description_empty():
    assert derive_title("", "garbage") == "New garbage report"


def test_derive_title_truncates_long_description():
    long_description = "x" * 200
    title = derive_title(long_description, "garbage")
    assert len(title) == 80
    assert title.endswith("…")


def test_resolve_category_id_maps_water_to_water_leak_slug():
    mock_client, categories_table, _, _ = _mock_supabase_client()
    with patch("app.report_submission.get_client", return_value=mock_client):
        result = resolve_category_id("water")

    assert result == CATEGORY_ID
    categories_table.select.return_value.eq.assert_called_once_with("slug", "water_leak")


def test_resolve_category_id_raises_when_not_found():
    mock_client, _, _, _ = _mock_supabase_client(category_rows=[])
    with patch("app.report_submission.get_client", return_value=mock_client):
        with pytest.raises(CategoryNotFound):
            resolve_category_id("not-a-category")


def test_create_issue_builds_expected_row():
    inserted_issue = {"id": ISSUE_ID, "reporter_id": REPORTER_ID, "status": "submitted"}
    mock_client, _, issues_table, _ = _mock_supabase_client(inserted_issue=inserted_issue)

    with patch("app.report_submission.get_client", return_value=mock_client):
        result = create_issue(
            reporter_id=REPORTER_ID,
            category="garbage",
            description="Garbage near the park entrance.",
            severity="medium",
            latitude=27.4833,
            longitude=83.2767,
            address="Lumbini Development Area",
            city="Lumbini",
        )

    assert result == inserted_issue
    row = issues_table.insert.call_args[0][0]
    assert row["reporter_id"] == REPORTER_ID
    assert row["category_id"] == CATEGORY_ID
    assert row["status"] == "submitted"
    assert row["location"] == "POINT(83.2767 27.4833)"
    assert row["title"] == "Garbage near the park entrance."


def test_create_issue_raises_reporter_not_registered_on_fk_violation():
    mock_client, _, issues_table, _ = _mock_supabase_client()
    issues_table.insert.return_value.execute.side_effect = Exception(
        'insert or update on table "issues" violates foreign key constraint '
        '"issues_reporter_id_fkey"'
    )

    with patch("app.report_submission.get_client", return_value=mock_client):
        with pytest.raises(ReporterNotRegistered):
            create_issue(
                reporter_id=REPORTER_ID,
                category="garbage",
                description="test",
                severity="low",
                latitude=27.7,
                longitude=85.3,
            )


def test_upload_issue_media_infers_image_type():
    inserted_media = {"id": "media-1", "issue_id": ISSUE_ID, "media_type": "image"}
    mock_client, _, _, media_table = _mock_supabase_client(inserted_media=inserted_media)

    with patch("app.report_submission.get_client", return_value=mock_client):
        result = upload_issue_media(
            issue_id=ISSUE_ID,
            uploaded_by=REPORTER_ID,
            index=0,
            filename="photo.png",
            file_bytes=b"fake-bytes",
            content_type="image/png",
        )

    assert result == inserted_media
    mock_client.storage.from_.assert_called_once_with("issue-media")
    mock_client.storage.from_.return_value.upload.assert_called_once_with(
        f"{ISSUE_ID}/0-photo.png", b"fake-bytes", {"content-type": "image/png"}
    )
    row = media_table.insert.call_args[0][0]
    assert row["media_type"] == "image"
    assert row["storage_path"] == f"{ISSUE_ID}/0-photo.png"


def test_upload_issue_media_infers_video_type():
    mock_client, _, _, media_table = _mock_supabase_client(
        inserted_media={"id": "media-2", "issue_id": ISSUE_ID, "media_type": "video"}
    )

    with patch("app.report_submission.get_client", return_value=mock_client):
        upload_issue_media(
            issue_id=ISSUE_ID,
            uploaded_by=REPORTER_ID,
            index=1,
            filename="clip.mp4",
            file_bytes=b"fake-bytes",
            content_type="video/mp4",
        )

    row = media_table.insert.call_args[0][0]
    assert row["media_type"] == "video"


def test_register_guest_reporter_creates_admin_user():
    mock_client = MagicMock()
    mock_user = MagicMock()
    mock_user.id = REPORTER_ID
    mock_client.auth.admin.create_user.return_value = MagicMock(user=mock_user)

    with patch("app.report_submission.get_client", return_value=mock_client):
        result = register_guest_reporter()

    assert result == REPORTER_ID
    call_args = mock_client.auth.admin.create_user.call_args[0][0]
    assert call_args["email"].endswith("@guest.duvida.local")
    assert call_args["email_confirm"] is True
    assert call_args["user_metadata"] == {"is_guest": True}


def test_guest_id_endpoint_success():
    with patch("app.main.register_guest_reporter", return_value=REPORTER_ID):
        response = client.post("/community/guest-id")
        assert response.status_code == 200
        assert response.json() == {"reporter_id": REPORTER_ID}


def test_guest_id_endpoint_supabase_error():
    with patch("app.main.register_guest_reporter", side_effect=RuntimeError("boom")):
        response = client.post("/community/guest-id")
        assert response.status_code == 503


def test_submit_issue_endpoint_success_without_files():
    issue = {"id": ISSUE_ID, "reporter_id": REPORTER_ID, "status": "submitted"}
    with patch("app.main.create_issue", return_value=issue) as mock_create:
        response = client.post(
            "/community/issues",
            data={
                "reporter_id": REPORTER_ID,
                "category": "garbage",
                "description": "Garbage near the park",
                "severity": "medium",
                "latitude": "27.4833",
                "longitude": "83.2767",
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["issue"] == issue
    assert body["media"] == []
    mock_create.assert_called_once()


def test_submit_issue_endpoint_success_with_file():
    issue = {"id": ISSUE_ID, "reporter_id": REPORTER_ID, "status": "submitted"}
    media_row = {"id": "media-1", "issue_id": ISSUE_ID, "storage_path": f"{ISSUE_ID}/0-photo.png"}

    with patch("app.main.create_issue", return_value=issue), patch(
        "app.main.upload_issue_media", return_value=media_row
    ) as mock_upload:
        response = client.post(
            "/community/issues",
            data={
                "reporter_id": REPORTER_ID,
                "category": "garbage",
                "description": "Garbage near the park",
                "severity": "medium",
                "latitude": "27.4833",
                "longitude": "83.2767",
            },
            files={"files": ("photo.png", b"fake-bytes", "image/png")},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["media"] == [media_row]
    mock_upload.assert_called_once()
    assert mock_upload.call_args.kwargs["filename"] == "photo.png"


def test_submit_issue_endpoint_unknown_category():
    with patch("app.main.create_issue", side_effect=CategoryNotFound("bogus")):
        response = client.post(
            "/community/issues",
            data={
                "reporter_id": REPORTER_ID,
                "category": "bogus",
                "description": "test",
                "severity": "low",
                "latitude": "27.7",
                "longitude": "85.3",
            },
        )
    assert response.status_code == 400


def test_submit_issue_endpoint_reporter_not_registered():
    with patch("app.main.create_issue", side_effect=ReporterNotRegistered(REPORTER_ID)):
        response = client.post(
            "/community/issues",
            data={
                "reporter_id": REPORTER_ID,
                "category": "garbage",
                "description": "test",
                "severity": "low",
                "latitude": "27.7",
                "longitude": "85.3",
            },
        )
    assert response.status_code == 422


def test_submit_issue_endpoint_supabase_error():
    with patch("app.main.create_issue", side_effect=RuntimeError("boom")):
        response = client.post(
            "/community/issues",
            data={
                "reporter_id": REPORTER_ID,
                "category": "garbage",
                "description": "test",
                "severity": "low",
                "latitude": "27.7",
                "longitude": "85.3",
            },
        )
    assert response.status_code == 503


def test_submit_issue_endpoint_media_upload_failure():
    issue = {"id": ISSUE_ID, "reporter_id": REPORTER_ID, "status": "submitted"}
    with patch("app.main.create_issue", return_value=issue), patch(
        "app.main.upload_issue_media", side_effect=RuntimeError("upload failed")
    ):
        response = client.post(
            "/community/issues",
            data={
                "reporter_id": REPORTER_ID,
                "category": "garbage",
                "description": "test",
                "severity": "low",
                "latitude": "27.7",
                "longitude": "85.3",
            },
            files={"files": ("photo.png", b"fake-bytes", "image/png")},
        )
    assert response.status_code == 502
