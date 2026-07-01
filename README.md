# Vela

Open-source AI customer support platform. Self-host it or use the cloud version.

Customers ask questions → AI answers from your docs → escalates to a human when it's not confident enough.

---

## Deploy it yourself or use the cloud

| | Self-hosted | Cloud |
|---|---|---|
| **Setup** | Docker Compose or Kubernetes | Sign up and go |
| **Data** | Stays on your infra | Hosted by us |
| **Cost** | Your API keys, your servers | Subscription |
| **License** | MIT | — |

---

## How it works

1. Upload your support docs (PDF, DOCX, TXT, Markdown)
2. Vela processes them into a searchable knowledge base
3. Customers ask questions via an embeddable chat widget
4. AI answers with citations — streaming, real-time
5. If confidence is low or customer asks for help, escalates to a human agent with a full AI-generated handoff summary
6. Agent joins a live chat with full context already loaded

---

## Stack

| Layer | Default | Swap it for |
|---|---|---|
| Backend | FastAPI (Python) | Any |
| Database | PostgreSQL + pgvector | Supabase |
| Hybrid search | pgvector (semantic) + PostgreSQL tsvector (keyword) | OpenSearch or Elasticsearch (replaces both) |
| Cache | Redis | Valkey, Upstash |
| Queue | Celery | BullMQ, RQ |
| Storage | AWS S3 | GCS, Azure Blob, Cloudflare R2, MinIO |
| AI | OpenAI GPT-4o + Anthropic Claude | Any OpenAI-compatible provider |
| Realtime | WebSockets + SSE | — |

pgvector is the default — it keeps your vector and relational data in one place. If you're already running OpenSearch or Elasticsearch at scale, swap the retrieval layer and nothing else changes.

---

## Self-hosted setup

```bash
git clone https://github.com/demilade111/konvai
cd konvai
cp .env.example .env        # add your API keys
docker compose up --build
```

- API → http://localhost:8000/docs
- Frontend → http://localhost:5173

---

## Features

- RAG pipeline — chunk, embed, retrieve, cite
- Confidence-based escalation — AI hands off when it doesn't know, not when it guesses wrong
- Real-time agent chat — WebSocket handoff with AI summary pre-loaded
- Multi-tenant — org-level data isolation, zero cross-tenant leakage
- Tool calling — AI can query orders, subscriptions, trigger actions with human approval
- Analytics — resolution rate, CSAT, cost per conversation, knowledge gaps
- Embeddable widget — drop one script tag on any site
