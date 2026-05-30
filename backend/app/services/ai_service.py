import json
from uuid import UUID

import chromadb
from openai import OpenAI

from app.core.config import settings

# Initialize clients
openai_client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)

# Collection for course content embeddings
COLLECTION_NAME = "course_content"


def get_collection():
    return chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def ingest_lesson_content(course_id: UUID, module_id: UUID, lesson_id: UUID, title: str, content: str):
    """Ingest lesson content into ChromaDB for RAG retrieval."""
    collection = get_collection()

    # Split content into chunks for better retrieval
    chunks = _split_into_chunks(content, max_length=1000, overlap=200)

    for idx, chunk in enumerate(chunks):
        doc_id = f"{lesson_id}_{idx}"
        collection.upsert(
            ids=[doc_id],
            documents=[chunk],
            metadatas=[{
                "course_id": str(course_id),
                "module_id": str(module_id),
                "lesson_id": str(lesson_id),
                "title": title,
                "chunk_index": idx,
            }],
        )


def retrieve_context(query: str, course_id: UUID, n_results: int = 5) -> str:
    """Retrieve relevant context from ChromaDB for a query within a course."""
    collection = get_collection()

    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where={"course_id": str(course_id)},
    )

    if not results.get("documents") or not results["documents"][0]:
        return ""

    contexts = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        contexts.append(f"[{meta.get('title', 'Unknown')}]\n{doc}")

    return "\n\n---\n\n".join(contexts)


def generate_tutor_response(query: str, course_id: UUID, course_title: str, chat_history: list[dict] | None = None) -> str:
    """Generate an AI tutor response using RAG."""
    if not openai_client:
        return "AI tutor is not configured. Please set the OPENAI_API_KEY environment variable."

    context = retrieve_context(query, course_id)

    system_prompt = f"""You are an AI tutor for the course "{course_title}".
Answer ONLY using the provided context from the course materials.
If the question is out of scope or you don't have enough information, politely redirect the student to review the relevant course content.
Be concise, helpful, and encouraging. Use clear explanations."""

    messages = [{"role": "system", "content": system_prompt}]

    if chat_history:
        for msg in chat_history[-10:]:  # Keep last 10 messages for context
            messages.append({"role": msg["role"], "content": msg["content"]})

    user_content = query
    if context:
        user_content = f"""Course Context:
{context}

Student Question: {query}"""

    messages.append({"role": "user", "content": user_content})

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        return response.choices[0].message.content or "I couldn't generate a response. Please try again."
    except Exception as e:
        return f"Error generating response: {str(e)}"


def generate_quiz_questions(lesson_content: str, lesson_title: str, num_questions: int = 5) -> list[dict]:
    """Generate quiz questions from lesson content using OpenAI."""
    if not openai_client:
        # Fallback: generate basic questions without AI
        return _generate_fallback_questions(lesson_content, lesson_title, num_questions)

    prompt = f"""Generate {num_questions} quiz questions based on the following lesson content.
Return a JSON array of objects with these fields:
- question: the question text
- options: array of 4 answer options
- correctIndex: index of the correct answer (0-3)

Lesson Title: {lesson_title}
Lesson Content:
{lesson_content[:3000]}

Return ONLY the JSON array, no other text."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a quiz generator. Output valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=2000,
        )

        content = response.choices[0].message.content or "[]"
        # Clean up the response - remove markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        questions = json.loads(content)
        return questions[:num_questions]
    except Exception:
        return _generate_fallback_questions(lesson_content, lesson_title, num_questions)


def _generate_fallback_questions(content: str, title: str, num_questions: int) -> list[dict]:
    """Generate basic questions without AI when OpenAI is unavailable."""
    words = content.split()
    key_terms = [w for w in words if len(w) > 6][:num_questions]

    questions = []
    for idx, term in enumerate(key_terms[:num_questions]):
        questions.append({
            "question": f"In the lesson \"{title}\", which concept is discussed?",
            "options": [term, "None of the above", "Irrelevant topic", "Unrelated subject"],
            "correctIndex": 0,
        })
    return questions


def _split_into_chunks(text: str, max_length: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks for better retrieval."""
    if len(text) <= max_length:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + max_length
        chunk = text[start:end]

        # Try to break at sentence boundary
        if end < len(text):
            last_period = chunk.rfind(".")
            if last_period > max_length // 2:
                chunk = chunk[: last_period + 1]
                end = start + last_period + 1

        chunks.append(chunk.strip())
        start = end - overlap

    return [c for c in chunks if c]
