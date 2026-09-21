-- Duplicate detection for resume uploads and job scans (see backend/src/contentHash.ts).
-- content_hash is a sha256 of the whitespace-normalized text. It is nullable so rows created
-- before this migration stay valid, and the unique indexes allow any number of NULLs.
-- Those older rows have no hash, so they are not matched as duplicates of new uploads.
-- Run once in the Supabase SQL Editor, after 001-005.

alter table candidates add column if not exists content_hash text;
alter table jobs add column if not exists content_hash text;

create unique index if not exists candidates_content_hash_unique on candidates (content_hash);
create unique index if not exists jobs_content_hash_unique on jobs (content_hash);
