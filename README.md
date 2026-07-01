# Vela

Open-source AI customer support platform. Self-host it or use the cloud version.

Customers ask questions → AI answers from your docs → escalates to a human when it's not confident enough.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI · Python |
| Database | PostgreSQL + pgvector |
| Search | Hybrid — pgvector (semantic) + tsvector (keyword) |
| Cache | Redis |
| Queue | Celery |
| Storage | AWS S3 |
| AI | OpenAI GPT-4o · Anthropic Claude |
| Realtime | WebSockets + SSE |
| Deployment | Docker Compose → Kubernetes |

---

## Self-hosted setup

```bash
git clone https://github.com/demilade111/konvai
cd konvai
cp .env.example .env
docker compose up --build
```

- API → http://localhost:8000/docs
- Frontend → http://localhost:5173
