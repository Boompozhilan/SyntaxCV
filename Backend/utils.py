import fitz  # PyMuPDF
from docx import Document
import io

def extract_text(file_bytes, filename):
    text = ""
    if filename.endswith('.pdf'):
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
    elif filename.endswith('.docx'):
        doc = Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text
