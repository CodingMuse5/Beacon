# Beacon — Project Guide & Interview Prep

This doc explains **what the code does, why it's built this way, and how to talk about it
in an interview.** It gets updated every time we finish a phase — treat it as the running
"explain this project to someone" reference.

Each phase section has three parts:
- **What it does** — the plain-English version
- **File-by-file** — what each piece of code is responsible for
- **Interview Q&A** — the "why this and not that" questions someone would actually ask

---

## Architecture, in one picture

```
frontend/     React — the only thing a human ever looks at
backend/      Node.js/Express/TypeScript — the only thing frontend ever talks to.
              Owns the database, file storage, and orchestration.
ai-service/   Python/FastAPI — a private microservice, only backend/ talks to it.
              Does nothing except call Gemini. No database access of its own.
```

**Q: Why two backends instead of one?**
Because "the backend" is doing two very different jobs: (1) ordinary web-app plumbing
(routing, database reads/writes, file uploads, calling external APIs) and (2) AI/ML calls.
Job (1) doesn't benefit from Python at all — it's just CRUD and HTTP. Job (2) needed
Python-friendly AI tooling. Rather than force one language to do both, `backend/` owns
everything except "produce AI output from text," and hands that one job to `ai-service/`
over a plain internal HTTP call. It also means `ai-service` is tiny and easy to reason
about — it has exactly 5 endpoints, no database, no auth, no business logic.

**Q: Isn't running two servers instead of one more complicated?**
Slightly, yes — but the complexity is *isolated*: `ai-service` doesn't know `backend`
exists, and `backend` only knows `ai-service`'s HTTP contract (5 URLs, JSON in, JSON out).
Neither side needs to understand the other's internals. That's the whole point of a
microservice boundary — it trades "one process" for "two processes that can't leak into
each other's mess."

---

## Phase 0 — Scaffolding

Set up the three empty shells (frontend, backend, ai-service), wired a `/health` endpoint
on each, connected the frontend to the backend, and connected the backend to Supabase
(Postgres + pgvector + file storage) and `ai-service` to Gemini. No real features yet —
this phase just proves all the wiring works before building anything on top of it.

---

## Phase 1 — Resume Ingestion

### What it does

Turns an uploaded resume file into a structured, searchable database record. One HTTP
request (`POST /resumes/upload`) triggers five steps:

1. **Receive** the file (`multer`, in memory — never touches disk)
2. **Extract** plain text from it (`pdf-parse` for PDF, `mammoth` for DOCX)
3. **Store** the original file in Supabase Storage (private bucket)
4. **Parse** the text into structured JSON using Gemini (name, email, skills, work
   history, education, summary)
5. **Embed** a focused version of that profile into a 384-number vector, and save both
   the structured data and the vector to Postgres

### File-by-file

| File | Responsibility |
|---|---|
| `backend/src/modules/resumeProcessing/router.ts` | The actual endpoint — orchestrates all 5 steps above, in order, with error handling at each one |
| `backend/src/textExtraction.ts` | Pure function: `(fileBuffer, mimetype) → plainText`. Knows nothing about HTTP, storage, or the database |
| `backend/src/embeddingText.ts` | Builds the string we actually embed — summary + skills + role titles, not the raw resume text (see Q&A) |
| `backend/src/aiService.ts` | Typed HTTP client for talking to `ai-service` — one function per endpoint, with TypeScript interfaces describing exactly what comes back |
| `backend/src/supabase.ts` | One shared Supabase client, used for both Storage and database calls |
| `ai-service/app/routers/resume.py` | Receives raw text, sends a prompt + JSON schema to Gemini, returns whatever structured JSON comes back |
| `ai-service/app/gemini_client.py` | Two tiny wrapper functions: `generate_json(prompt, schema)` and `embed_text(text)` — every AI router in `ai-service` is built on just these two |

### Interview Q&A

**Q: Why store the file, the raw text, AND the parsed JSON separately, instead of just
keeping the final structured data?**
Because each layer might need to be redone independently without redoing the others. If
we improve the Gemini prompt next month, we can re-parse every existing resume from its
stored `raw_text` — no need to re-upload files. If text extraction had a bug, the original
file is still there to reprocess from scratch. Collapsing all three into one step would
mean any future fix requires starting over from the original file every time.

**Q: Why use an LLM to parse the resume instead of writing a regex/rule-based parser?**
Resumes don't follow one format — everyone writes "Skills," "Experience," and dates
differently. A regex parser breaks the moment a candidate formats things slightly
differently than expected. An LLM reads it the way a human would: by understanding
meaning, not matching a fixed pattern. This is also the actual "AI" in an "AI-powered"
product — not decorative, it's the only realistic way to handle unstructured input at
this level of variability.

**Q: What is an embedding, actually?**
A list of 384 numbers representing a piece of text's *meaning* as a point in
384-dimensional space. Texts with similar meaning end up as points that are
mathematically close together — even if they don't share any of the same words. "Built
scalable APIs" and "designed high-throughput services" would land near each other, even
though not one word matches.

**Q: Why embed a custom-built string (summary + skills + roles) instead of just embedding
the whole raw resume text?**
Raw resume text is full of noise for this purpose — headers, dates, formatting artifacts,
irrelevant personal details. Embedding all of that dilutes the vector's signal. A focused
string keeps the vector centered on what actually matters for matching: what the person
can do and has done. It also has to be built the *same way* for jobs (Phase 2) — you can
only meaningfully compare two vectors if both were built from comparable inputs.

**Q: Why is `candidate_embeddings` a separate table instead of a column on `candidates`?**
Two reasons: (1) a `vector` column needs a special index (`ivfflat`) for fast similarity
search, which is cleaner to manage on its own table, and (2) it leaves room for a
candidate to eventually have multiple embeddings (e.g. one per resume version) without
restructuring the schema.

**Q: Why is the Supabase Storage bucket private instead of public?**
These are people's resumes — real names, emails, phone numbers, work history. A public
bucket means anyone with the URL can download the file forever, and URLs leak (browser
history, logs, screenshots). A private bucket requires generating a **signed URL** on
demand — a link that expires after a set time (say, 1 hour) — so access is deliberate and
time-limited, not permanent by accident.

**Q: Why does the file upload use `multer.memoryStorage()` instead of writing to disk?**
Because nothing in this pipeline actually needs the file to exist as a file on the
server's disk. We only ever need its *bytes* — once to extract text, once to upload to
Supabase. Keeping it in memory as a `Buffer` skips a disk write, a disk read, and a
cleanup step, and avoids leaving resume files sitting on the server's filesystem even
temporarily.

**Q: What happens if something fails partway through (e.g. Gemini parsing works but the
database insert fails)?**
Right now: the request returns a clear error and the recruiter retries the upload. There's
no rollback of the already-uploaded storage file. This is a deliberate scope decision for
now — building proper compensation/rollback logic is real engineering effort that isn't
worth it before the product's core loop even works end to end. Worth flagging as a known
gap if asked "what would you do differently in production."

**Q: Why did only `candidates` and `candidate_embeddings` get filled, and not the other 4
tables?**
Because each of the 6 tables belongs to a specific phase/feature, and only resume
ingestion (Phase 1) has been built so far:

| Table | Phase | Status |
|---|---|---|
| `candidates` | 1 — Resume Processing | ✅ built |
| `candidate_embeddings` | 1 — Resume Processing | ✅ built |
| `jobs` | 2 — Job Intelligence | ✅ built |
| `github_profiles` | GitHub Intelligence | ⬜ not built yet |
| `matches` | Matching Engine | ⬜ not built yet |
| `insight_cards` | Explainability | ⬜ not built yet |

---

## Phase 2 — Job Intelligence

### What it does

Turns a pasted job description into the same kind of structured, comparable data Phase 1
created for candidates. One HTTP request (`POST /jobs/analyze`) triggers four steps:

1. **Receive** `{ title, raw_text }` as plain JSON (no file upload — JDs are pasted text)
2. **Parse** the text into a structured "Job Blueprint" using Gemini: required skills,
   nice-to-have skills, seniority, responsibilities, minimum years of experience, summary
3. **Embed** a focused version of that blueprint into a 384-number vector — built the
   *same way* as a candidate's embedding text (summary + skills), so the two vectors are
   actually comparable later
4. **Save** the job, its blueprint, and its embedding to Postgres

This is structurally almost identical to Phase 1 (parse with Gemini → embed → save) —
that's deliberate reuse of a pattern that already works, not a coincidence.

### File-by-file

| File | Responsibility |
|---|---|
| `backend/src/modules/jobIntelligence/router.ts` | The endpoint — validates input, orchestrates parse → embed → save, error handling |
| `backend/src/embeddingText.ts` (`buildJobEmbeddingText`) | Builds the string to embed: summary + required skills + nice-to-have skills — the job-side mirror of `buildCandidateEmbeddingText` |
| `ai-service/app/routers/job.py` | Receives title + raw text, sends a prompt + JSON schema to Gemini, returns the structured blueprint |
| `ai-service/sql/002_job_embedding.sql` | Migration adding the `embedding` column to `jobs` (didn't exist after Phase 1, since only candidates needed embeddings then) |

### Interview Q&A

**Q: Why does a job's embedding live in a column on `jobs`, instead of a separate
`job_embeddings` table like candidates have?**
Because a job only ever needs *one* embedding — there's no equivalent of "multiple resume
versions" for a job posting. `candidate_embeddings` is a separate table specifically to
leave room for a candidate having more than one embedding later. Without that need, a
plain column is simpler and avoids an unnecessary join. This is a good example of not
copying a pattern just for consistency — the two entities have different shapes of future
need, so their storage differs too.

**Q: Why does the job description come in as pasted text instead of an uploaded file, when
resumes use file upload?**
Because that's genuinely how the two differ in practice: resumes are formatted documents
someone already has as a file, but a job description is usually typed or pasted directly
by whoever's hiring — often composed on the spot, not saved as a PDF beforehand. Building
file-upload support for JDs would be solving a problem that doesn't really exist yet.

**Q: Why build `buildJobEmbeddingText` to mirror `buildCandidateEmbeddingText`'s shape
(summary + skills) instead of embedding the full blueprint JSON or the full raw text?**
Because embeddings are only meaningfully comparable when built from the same *kind* of
input. If a candidate's vector was built from "summary + skills" but a job's vector was
built from the entire raw job posting (including boilerplate like benefits, company
description, legal text), the two vectors would carry different kinds of information —
their distance wouldn't cleanly express "how well does this person match this role,"
because a lot of the job vector's "signal" would be about company perks, not
requirements.

**Q: What would you do differently in production here?**
Handle upstream failures more gracefully — right now a Gemini rate-limit or transient
error just bubbles up as a 502 to the caller with no retry. In testing this phase, the
very first request failed with a generic "500 Internal Server Error" from Gemini's side,
and simply retrying succeeded. A production version would retry transient failures
automatically (with backoff) before giving up, instead of making the caller retry by
hand.

---

*(Next section — Phase 3: Matching Engine — will be added once that phase is built.)*
