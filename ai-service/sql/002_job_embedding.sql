-- Adds job embeddings, stored directly on `jobs` (a job only ever needs one embedding,
-- unlike candidates where multiple resume versions were a real possibility).
-- Run once in the Supabase SQL Editor, after 001_init.sql.

alter table jobs add column if not exists embedding vector(384);

create index if not exists jobs_embedding_idx
    on jobs using ivfflat (embedding vector_cosine_ops) with (lists = 100);
