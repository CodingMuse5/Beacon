-- The ivfflat index created in 001_init.sql (`with (lists = 100)`) is an *approximate*
-- nearest-neighbor index. With only a handful of candidate rows, 100 clusters is wildly
-- oversized for the data: most clusters are empty, and a query vector that isn't already
-- one of the stored vectors can miss every cluster that actually holds data — silently
-- returning zero rows from `match_candidates` for real (non-self) queries, even though
-- the underlying data and distance math are both correct.
--
-- Fix: drop it. A sequential scan is both simpler and exact at this data volume. A
-- properly-tuned index (lists sized to the real row count) can be re-added later once
-- there's enough data to justify one.
-- Run once in the Supabase SQL Editor.

do $$
declare
    idx record;
begin
    for idx in
        select indexname from pg_indexes
        where tablename = 'candidate_embeddings'
        and indexdef ilike '%embedding%'
        and indexname != 'candidate_embeddings_pkey'
    loop
        execute format('drop index if exists %I', idx.indexname);
    end loop;
end $$;

-- Recreate match_candidates cleanly (unchanged logic, just re-applied for certainty).
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

-- Remove the temporary debug function used while diagnosing this issue.
drop function if exists debug_vector(vector(384));
