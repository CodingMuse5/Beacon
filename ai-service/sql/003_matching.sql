-- Adds the vector-similarity search function the matching engine uses, and a uniqueness
-- constraint on matches so recomputing a job's matches updates scores instead of
-- duplicating rows.
-- Run once in the Supabase SQL Editor, after 001_init.sql and 002_job_embedding.sql.

create or replace function match_candidates(query_embedding vector(384), match_count int default 50)
returns table (
    candidate_id uuid,
    similarity float
)
language sql stable
as $$
    select
        candidate_embeddings.candidate_id,
        1 - (candidate_embeddings.embedding <=> query_embedding) as similarity
    from candidate_embeddings
    order by candidate_embeddings.embedding <=> query_embedding
    limit match_count;
$$;

alter table matches add constraint matches_job_candidate_unique unique (job_id, candidate_id);
