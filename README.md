# Konvai — AI Customer Support Platform

> AI-powered support platform that answers customer questions from company documentation, escalates to human agents when needed, and never answers what it doesn't know.

---

## What It Does

- Customers ask questions via an embeddable chat widget
- AI retrieves answers from uploaded company docs (RAG) and streams a cited response
- If confidence is low or customer is frustrated, escalates to a human agent with a full AI-generated summary
- Agent joins a real-time chat with full conversation context already loaded

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind |
| Backend | Python + FastAPI |
| Database | PostgreSQL + pgvector |
| Cache | Redis |
| Queue | Celery |
| Storage | AWS S3 |
| AI | OpenAI GPT-4o + Anthropic Claude Sonnet |
| Realtime | WebSockets + SSE |
| Deployment | Docker Compose → Kubernetes |

---

## Key Features

- **RAG pipeline** — chunk, embed, store, retrieve, cite
- **Confidence-based escalation** — AI stops when it doesn't know
- **Real-time agent chat** — WebSocket handoff with AI-generated summary
- **Multi-tenant** — org-level data isolation at the database layer
- **Tool calling** — AI can look up subscriptions, orders, and trigger actions
- **Analytics dashboard** — resolution rate, CSAT, cost per conversation, knowledge gaps
- **Document types** — PDF, DOCX, TXT, Markdown

---

## Project Highlights (Interview)

- Built a multi-tenant RAG platform with org-scoped pgvector search and PostgreSQL row-level security — zero cross-tenant data leakage by design
- Engineered confidence-based escalation outside the LLM — retrieval scores and sentiment signals trigger handoff, not the model's self-assessment
- Designed an AI handoff summary system that gives agents full context before they type a single word, reducing handle time structurally
- Owned the full stack: data model, async document pipeline (Celery), SSE streaming, WebSocket real-time chat, React dashboard, and Docker deployment

---

## Local Setup

```bash
# Clone and start
git clone <repo>
cd konvai
cp .env.example .env        # fill in API keys
docker compose up --build   # starts all services
```

Services:
- API → http://localhost:8000
- Frontend → http://localhost:5173
- API Docs → http://localhost:8000/docs

---

## Smoke Test

Once running, verify the core flow:

- [ ] Register an organization at `/register`
- [ ] Upload a PDF in the admin dashboard → status changes to `ready`
- [ ] Open the AI test interface → ask a question → response streams with citation
- [ ] Open the customer widget → ask the same question → see streamed response
- [ ] Type "I want to talk to a human" → escalation triggers → ticket created
- [ ] Open agent dashboard → ticket appears with AI summary
- [ ] Agent replies → message appears in customer widget in real-time

---

## Docs

- [PRD](docs/PRD.md) — full product requirements and scope
