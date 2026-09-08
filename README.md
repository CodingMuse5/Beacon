# VStack — Talent Matching Platform

AI-powered resume/JD matching platform.

## Structure

```
backend/    FastAPI app, one module per architecture-diagram box
  app/
    modules/
      resume_processing/   upload + parse resumes into candidate profiles
      job_intelligence/    JD -> structured "Job Blueprint"
      matching_engine/     embeddings + composite scoring, ranked queue
      github_intelligence/ tech-stack + credibility scoring from GitHub
      explainability/      Insight Cards with resume citations
frontend/   React + Vite + Tailwind + TanStack Query
```

## Prerequisites

- Python 3.11+
- Node 20+
- A free [Supabase](https://supabase.com) project (Postgres + pgvector + Storage + Auth)
- An [Anthropic API key](https://console.anthropic.com) (for resume/JD parsing and Insight Cards)
- A [GitHub personal access token](https://github.com/settings/tokens) (for GitHub Intelligence)

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Fill in `.env` with your Supabase URL/service role key, Anthropic key, and GitHub token. Then run:

```bash
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/health` — you should see `{"status": "ok"}`.

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Visit `http://localhost:5173` — the page checks the backend's `/health` endpoint and shows a green dot when both sides are wired up correctly. That's the Phase 0 exit criteria from the roadmap.

## Supabase setup

1. Create a project at supabase.com.
2. In the SQL editor, run: `create extension if not exists vector;`
3. Create a Storage bucket named `resumes`.
4. Copy the Project URL and `service_role` key (Project Settings → API) into `backend/.env`.
5. Create the tables from the roadmap's Data Model section (`candidates`, `jobs`, `candidate_embeddings`, `matches`, `insight_cards`, `github_profiles`).

## Next steps

Follow the phased roadmap: Phase 1 is resume ingestion (upload → parse → store), building on the `/resumes/upload` stub already in `backend/app/modules/resume_processing/router.py`.
