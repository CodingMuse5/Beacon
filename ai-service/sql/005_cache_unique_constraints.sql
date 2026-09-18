-- Manual refresh (see backend explainability/router.ts and githubIntelligence/router.ts)
-- upserts into these caches instead of always inserting, so a repeat lookup replaces the
-- existing row rather than creating a second one. Upsert needs a conflict target to key
-- on, which neither table had.
-- Run once in the Supabase SQL Editor, after 001-004.

alter table insight_cards add constraint insight_cards_match_id_unique unique (match_id);
alter table github_profiles add constraint github_profiles_username_unique unique (username);
