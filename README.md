# Vela

Open-source AI customer support. Upload your docs, get an AI agent that answers from them — with citations — and escalates to a human when needed.

## What it does

- **Ingest docs** — PDF, DOCX, Markdown, plain text. Processed in the background via Celery.
- **Answer questions** — Hybrid search (semantic + keyword) finds relevant chunks, then the AI responds with streaming and source citations.
- **Escalate when needed** — Low confidence, explicit request, or negative sentiment triggers a handoff to a human agent with full context.

## Stack

FastAPI · PostgreSQL + pgvector · Redis · Celery · AWS S3 · React + Vite · Docker Compose

## Quick start

```bash
git clone https://github.com/demilade111/konvai
cd konvai
cp .env.example .env   # add your API keys
docker compose up --build
```

| Service | URL |
|---|---|
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
