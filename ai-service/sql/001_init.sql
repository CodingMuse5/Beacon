-- Beacon initial schema
-- Run once in the Supabase SQL Editor (pgvector must already be enabled).

create extension if not exists vector;

create table if not exists candidates (
    id uuid primary key default gen_random_uuid(),
    full_name text,
    email text,
    phone text,
    resume_storage_path text,
    raw_text text,
    parsed_profile jsonb,
    skills text[],
    created_at timestamptz not null default now()
);

create table if not exists jobs (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    raw_text text not null,
    blueprint jsonb,
    created_at timestamptz not null default now()
);

-- all-MiniLM-L6-v2 (sentence-transformers, used in requirements.txt) outputs 384-dim vectors
create table if not exists candidate_embeddings (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references candidates(id) on delete cascade,
    embedding vector(384) not null,
    created_at timestamptz not null default now()
);

create table if not exists github_profiles (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid references candidates(id) on delete cascade,
    username text not null,
    tech_stack_score numeric,
    credibility_score numeric,
    raw_data jsonb,
    created_at timestamptz not null default now()
);

create table if not exists matches (
    id uuid primary key default gen_random_uuid(),
    job_id uuid not null references jobs(id) on delete cascade,
    candidate_id uuid not null references candidates(id) on delete cascade,
    score numeric,
    created_at timestamptz not null default now()
);

create table if not exists insight_cards (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references matches(id) on delete cascade,
    content jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists candidate_embeddings_embedding_idx
    on candidate_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);
