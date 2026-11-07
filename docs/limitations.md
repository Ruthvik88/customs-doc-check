# Limitations

Honest limits of this MVP. These should be addressed before any production
deployment handling real customs data.

## AI reliability
- Free-tier AI (Gemini free tier) is **not production-compliant** for customs
  declarations. Accuracy is not guaranteed; every extracted field must be
  confirmed or edited by a person before export.
- Confidence is recomputed deterministically (model confidence + validators +
  presence in text), but this is a heuristic, not a ground-truth probability.
- No bounding-box highlighting is provided on the document: vision-model
  bounding boxes are unreliable, so only page-level source references are
  shown.
- Unreadable/blank pages, API errors, and rate limits (429 with exponential
  backoff) fall back to a manual-entry form with a clear error state — never
  a silent failure.

## Missing features (out of scope)
- No customs portal filing integration.
- No HSN classification or duty calculation.
- No customer tracking portal.
- No OCR layout analysis beyond whole-document structured extraction.

## Data & security
- Role-based access is enforced server-side and via Supabase RLS, but RLS
  policies are simple (executive vs manager) and assume a small trusted team.
- Document contents are not logged. Files are stored in a private Supabase
  Storage bucket and served via short-lived (5-minute) signed URLs.
- Only two demo users are seeded (`exec@demo.local`, `manager@demo.local`);
  real deployments need proper onboarding, password policy, and MFA.
- Rate limiting on the extraction endpoint is in-memory (per-process) and
  suitable only for a single instance; production should use Redis/Upstash.

## Deployment
- Deploys on Vercel; Supabase in ap-south-1. Server-side keys
  (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) must never be committed.
- Route `maxDuration` is set for extraction; Vercel Hobby plans cap function
  duration at 60s — use Pro for long extractions or rely on cached mode for
  demos.

## Seed data
All seed companies, people, and values are fictional; no real personal data is
included. Seed PDFs are generated with reportlab/Pillow and committed under
`data/seeds/`.
