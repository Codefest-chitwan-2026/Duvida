import pathlib

import fitz  # PyMuPDF
from docx import Document

KNOWLEDGE_DIR = pathlib.Path(__file__).resolve().parent.parent / "sustainability_knowledge"


def load_knowledge_text() -> str:
    if not KNOWLEDGE_DIR.exists():
        return ""

    chunks = []
    for path in sorted(KNOWLEDGE_DIR.iterdir()):
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            chunks.append(_read_pdf(path))
        elif suffix == ".docx":
            chunks.append(_read_docx(path))
        elif suffix == ".txt":
            chunks.append(path.read_text(encoding="utf-8"))

    return "\n\n".join(chunk for chunk in chunks if chunk.strip())


def _read_pdf(path: pathlib.Path) -> str:
    with fitz.open(path) as doc:
        return "\n".join(page.get_text() for page in doc)


def _read_docx(path: pathlib.Path) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)
