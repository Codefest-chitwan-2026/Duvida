import pathlib
from typing import Iterator, Tuple

import fitz
from docx import Document

KNOWLEDGE_DIR = pathlib.Path(__file__).resolve().parent.parent / "sustainability_knowledge"


def iter_documents() -> Iterator[Tuple[str, str]]:
    """Yield the filename and extracted text for every supported knowledge document."""
    if not KNOWLEDGE_DIR.exists():
        return

    for path in sorted(KNOWLEDGE_DIR.iterdir()):
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            text = _read_pdf(path)
        elif suffix == ".docx":
            text = _read_docx(path)
        elif suffix == ".txt":
            text = path.read_text(encoding="utf-8")
        else:
            continue

        if text.strip():
            yield path.name, text


def load_knowledge_text() -> str:
    return "\n\n".join(text for _, text in iter_documents())


def _read_pdf(path: pathlib.Path) -> str:
    with fitz.open(path) as document:
        return "\n".join(page.get_text() for page in document)


def _read_docx(path: pathlib.Path) -> str:
    document = Document(path)
    return "\n".join(paragraph.text for paragraph in document.paragraphs)
