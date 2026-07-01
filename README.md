# Vela

> Open-source AI customer support platform. Self-host it or deploy to the cloud.

Vela lets companies upload their support documentation and instantly get an AI agent that answers customer questions with citations, streams responses in real-time, and hands off to a human agent — with full context — when it isn't confident enough to answer.

Built for teams who want the transparency of open source, the flexibility to run it on their own infrastructure, and the option to just sign up and go.

---

## The Problem

Customer support is broken in two ways:

1. **Too slow for customers** — they wait hours or days for answers that exist in a help doc
2. **Too repetitive for agents** — 80% of tickets are the same 20 questions, answered manually, over and over

AI chatbots exist but they hallucinate. They answer confidently when they're wrong. Customers lose trust fast.

Vela solves both. The AI only answers from your actual documentation, cites its sources, and knows when to stop and get a human — rather than guessing and getting it wrong.

---

## How It Works

### 1. Knowledge Base Ingestion

A company uploads their support docs — PDFs, Word documents, Markdown files, plain text. Vela runs an async processing pipeline:

```
File uploaded to S3
        ↓
Celery worker picks up the job (background, non-blocking)
        ↓
Text extracted (pdfplumber for PDF, python-docx for DOCX)
        ↓
Text split into overlapping chunks (400 tokens, 50 token overlap)
        ↓
Each chunk embedded via OpenAI text-embedding-3-small
        ↓
Embeddings stored in PostgreSQL with pgvector
Full text stored for keyword search via tsvector
        ↓
Document status → "ready"
```

Chunking with overlap means answers that span two sections are never missed. The 50-token overlap carries context across chunk boundaries.

### 2. Hybrid Search (Semantic + Keyword)

When a customer asks a question, Vela runs two searches simultaneously and combines them:

**Semantic search (pgvector)**
Converts the question into an embedding vector and finds the chunks whose meaning is most similar — even if the exact words don't match.

```sql
SELECT content, 1 - (embedding <=> query_vector) AS score
FROM chunks
WHERE org_id = :org_id
ORDER BY embedding <=> query_vector
LIMIT 20;
```

**Keyword search (PostgreSQL tsvector)**
Finds chunks containing the exact words from the question. Critical for product names, error codes, version numbers — things semantic search misses.

```sql
SELECT content, ts_rank(search_vector, query) AS score
FROM chunks
WHERE org_id = :org_id
AND search_vector @@ query
ORDER BY score DESC
LIMIT 20;
```

**Reciprocal Rank Fusion**
Both result sets are merged using RRF — a rank-combining algorithm that rewards chunks that appear high in both lists. The top 5 go into the AI prompt.

This is why Vela finds the right answer whether a customer types _"how do I cancel"_ (semantic wins) or _"ERR_CONNECTION_REFUSED port 443"_ (keyword wins).

### 3. AI Response with Streaming

The top 5 chunks, the conversation history, and the customer's question go into a structured prompt. The response streams back via Server-Sent Events (SSE) — the customer sees words appear as the model generates them, not a long wait followed by a wall of text.

Every response includes citations pointing back to the source document and chunk.

### 4. Confidence-Based Escalation

Escalation is not decided by the AI — it's decided by the system. Three signals trigger handoff:

- **Low retrieval score** — pgvector similarity is below threshold, meaning the docs don't contain a good answer
- **Explicit request** — customer says "talk to a human", "agent", "real person"
- **Negative sentiment** — async Claude call detects frustration or distress in the message

When any signal fires, the AI stops, creates a ticket, generates a handoff summary, and notifies an available agent. The customer sees a queue position and estimated wait time.

### 5. Human Agent Takeover

The agent opens the ticket and sees:
- AI-generated summary of the entire conversation
- What the customer needed, what the AI tried, why it escalated
- Full message history
- Customer's past conversations (cross-session memory)

The agent joins a live WebSocket chat. Both sides see messages in real-time. When resolved, the agent closes the ticket. The customer rates the interaction.

---

## Architecture

```
                        ┌─────────────────────────────────┐
                        │         Customer Browser         │
                        │   Embeddable Chat Widget (SSE)   │
                        └────────────────┬────────────────┘
                                         │ HTTPS
                        ┌────────────────▼────────────────┐
                        │           FastAPI (Python)        │
                        │     Async · Non-blocking · REST   │
                        │     WebSocket · SSE endpoints     │
                        └──┬──────────────┬───────────────┘
                           │              │
             ┌─────────────▼──┐    ┌──────▼──────────────┐
             │   PostgreSQL    │    │        Redis          │
             │  pgvector       │    │  Session memory       │
             │  tsvector       │    │  Celery queue         │
             │  Relational     │    │  Celery results       │
             └────────────────┘    └──────────────────────┘
                                          │
                        ┌─────────────────▼───────────────┐
                        │          Celery Worker            │
                        │   Document processing             │
                        │   Embedding generation            │
                        │   Conversation summarization      │
                        │   Email notifications             │
                        └──────────────┬──────────────────┘
                                       │
                        ┌──────────────▼──────────────────┐
                        │             AWS S3                │
                        │   Raw document storage            │
                        └─────────────────────────────────┘
```

Every heavy operation (PDF parsing, embedding generation, AI summarization) runs through Celery so the API never blocks waiting for slow work.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | FastAPI + Python | Async-first, non-blocking I/O, best AI ecosystem |
| Database | PostgreSQL 16 | Battle-tested, ACID, relational + vector in one |
| Semantic search | pgvector | Store and query embeddings without a separate vector DB |
| Keyword search | PostgreSQL tsvector | Built-in full-text search, same DB, no extra service |
| Cache + Queue broker | Redis | In-memory speed for session state and Celery messages |
| Background jobs | Celery | Distributed task queue — offloads all slow work from API |
| File storage | AWS S3 | Durable object storage for uploaded documents |
| AI — chat | OpenAI GPT-4o + Anthropic Claude | Switchable per org, fallback on failure |
| AI — embeddings | OpenAI text-embedding-3-small | 1536-dim vectors, cost-efficient at scale |
| Realtime — streaming | Server-Sent Events (SSE) | One-directional, lightweight, works in every browser |
| Realtime — chat | WebSockets | Bidirectional for live agent ↔ customer chat |
| Frontend | React + Vite + TypeScript + Tailwind | Fast DX, type-safe, hot reload |
| Deployment | Docker Compose → Kubernetes | Local dev matches production shape |

---

## pgvector vs OpenSearch / Elasticsearch

Vela defaults to **pgvector** for vector search and **PostgreSQL tsvector** for keyword search — both in the same database you're already running.

**Why pgvector first:**
- No extra service to run, monitor, or scale
- Vector data and relational data (users, orgs, tickets) are colocated — joins are fast and consistent
- ACID guarantees — your embeddings are transactionally consistent with everything else
- Good enough for millions of chunks at typical SaaS scale

**When to swap to OpenSearch or Elasticsearch:**
- You have tens of millions of documents and need sub-20ms ANN search
- You need advanced search features: autocomplete, faceting, synonyms, search analytics
- Your team already operates an OpenSearch / Elasticsearch cluster

Both OpenSearch and Elasticsearch support hybrid search natively (kNN for semantic + BM25 for keyword), so swapping means replacing the retrieval layer only — the rest of the pipeline stays identical.

The abstraction is designed so the search backend is a single service class. Swap the implementation without touching the API, the prompt builder, or the frontend.

---

## Multi-tenancy

Every table has an `org_id` column. Every query is scoped to the requesting organization. No cross-tenant data leakage by design — enforced at the query layer and backed by PostgreSQL row-level security policies.

```
organizations
    └── users (org_id)
    └── documents (org_id)
    └── chunks (org_id)       ← vector search always filters by org_id
    └── conversations (org_id)
    └── tickets (org_id)
    └── analytics_events (org_id)
```

---

## Self-Hosted Setup

```bash
git clone https://github.com/demilade111/konvai
cd konvai
cp .env.example .env        # fill in your API keys
docker compose up --build
```

| Service | URL |
|---|---|
| API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## Deployment

Vela ships with Docker Compose for local development. Production deployment targets Kubernetes with:

- Horizontal Pod Autoscaler on the API and Celery worker
- PgBouncer for PostgreSQL connection pooling
- Redis Cluster for high availability
- CDN delivery for the embeddable widget bundle

---

## License

MIT — use it, fork it, self-host it, build on it.
