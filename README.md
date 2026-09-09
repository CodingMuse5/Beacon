# VStack — Talent Matching Platform

AI-powered resume/JD matching platform.

## Structure

```
frontend/     React + Vite + Tailwind + TanStack Query
backend/      Node.js + Express + TypeScript — main API, owns Supabase, GitHub API,
              file handling, and orchestration. One module per architecture-diagram box:
                resumeProcessing/    upload + store candidate profiles
                jobIntelligence/     JD ingestion, calls ai-service for the blueprint
                matchingEngine/      composite scoring, ranked queue
                githubIntelligence/  fetches GitHub data, calls ai-service for scoring
                explainability/      requests Insight Cards from ai-service
ai-service/   Python + FastAPI — AI-only microservice, called internally by backend/:
                POST /parse-resume   raw resume text -> structured candidate profile
                POST /parse-job      raw JD text -> structured job blueprint
                POST /embed          text -> vector embedding
                POST /insight-card   candidate + job -> match explanation w/ citations
                POST /github-score   GitHub profile/repo data -> credibility score
```

`backend/` is the only piece the frontend or the outside world ever talks to. `ai-service/`
is an internal service backend/ calls over HTTP — it has no database access and does no
routing/business logic, only AI/ML calls (via Gemini).

## Prerequisites

- Node 20+
- Python 3.11+ (for `ai-service/` only)
- A free [Supabase](https://supabase.com) project (Postgres + pgvector + Storage)
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier, for resume/JD parsing, embeddings, and Insight Cards)
- A [GitHub personal access token](https://github.com/settings/tokens) (for GitHub Intelligence)

## ai-service setup (Python)

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Fill in `.env` with your Gemini API key. Then run:

```bash
uvicorn app.main:app --reload --port 8001
```

Visit `http://localhost:8001/health` — you should see `{"status": "ok"}`.

## Backend setup (Node)

```bash
cd backend
npm install
copy .env.example .env
```

Fill in `.env` with your Supabase URL/service role key and GitHub token (`AI_SERVICE_URL`
already defaults to `http://localhost:8001`). Then run:

```bash
npm run dev
```

Visit `http://localhost:8000/health` — you should see `{"status": "ok"}`.

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Visit `http://localhost:5173` — the page checks the backend's `/health` endpoint and shows a green dot when everything's wired up correctly.

## Supabase setup

1. Create a project at supabase.com.
2. In the SQL editor, run the contents of [`ai-service/sql/001_init.sql`](ai-service/sql/001_init.sql) — creates the `vector` extension and all 6 tables (`candidates`, `jobs`, `candidate_embeddings`, `github_profiles`, `matches`, `insight_cards`).
3. Create a Storage bucket named `resumes`.
4. Copy the Project URL and `service_role` key (Project Settings → API) into `backend/.env`.

## Next steps

Phase 1 is resume ingestion (upload → parse → store), wiring `backend/src/modules/resumeProcessing/router.ts` to: store the file in Supabase Storage, extract its text, call `ai-service`'s `/parse-resume` and `/embed`, then write the result into `candidates` and `candidate_embeddings`.
