# Customs Doc Check

AI document extraction and cross-check tool for a customs broker at Nhava
Sheva (Navi Mumbai). Drop in a shipment's three documents (commercial invoice,
packing list, bill of lading), get structured data back ready to check, catch
mismatches across documents (e.g. weights differing), and export to CSV for
existing filing software.

Target: entry time 45 → under 15 min per shipment.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind
- Supabase (Postgres, Auth, Storage), region ap-south-1
- Zod (all input validation), Vitest (tests)
- @google/genai (Gemini structured output)
- Deployable on Vercel

## Roles
- Documentation executive: creates shipments, uploads docs, runs extraction,
  reviews and confirms fields.
- Documentation manager: approves shipments and exports. Only the manager can
  approve/export.

## Demo logins (seeded)
| Role | Email | Password |
|---|---|---|
| Executive | exec@demo.local | exec@demo.local |
| Manager | manager@demo.local | manager@demo.local |

Seed shipments include SHP-24811 (weight mismatch 3120 vs 3165 kg), SHP-24814
(invoice total mismatch), SHP-24815 (skewed scan), SHP-24816 (bilingual),
SHP-24817 (missing bill of lading), plus clean shipments. All fictional.

## Folder structure
```
app/                  Next.js App Router (login, dashboard, shipments/[id],
                      review, approve, export, reports)
components/           UI kit, layout, document viewer, field rows
lib/                  supabase clients, extraction service, cross-checks,
                      confidence, ISO 6346
types/                Postgres Database type
tests/                Vitest unit tests (cross-checks, ISO 6346, confidence)
database/             schema.sql (schema, RLS, security-definer functions)
scripts/seed.py       Offline generator for seed PDFs + cached extraction JSON
data/seeds/           Committed seed PDFs + cached extraction JSON
docs/                 assumptions.md, export-layout.md, limitations.md
.env.example          Environment variable names only (no values)
```

## Run locally
```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values (never commit real secrets)
cp .env.example .env

# 3. Set up Supabase (see deployment.md)
#    - Create project in region ap-south-1
#    - Apply database/schema.sql
#    - Create private Storage bucket "documents"
#    - Seed demo users (see deployment.md)

# 4. Run dev server
npm run dev

# 5. Run tests
npm test
```

## Environment variables
Variable names only — values go in `.env` (gitignored). See `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (seed script and extraction worker only)
- `GEMINI_API_KEY`, `GEMINI_MODEL`
- `EXTRACTION_MODE` (cached \| live) — default `cached`
- `CONFIDENCE_THRESHOLD` — default `0.80`
- `WEIGHT_TOLERANCE` — default `0.005`
- `MAX_UPLOAD_SIZE` — default `10485760`
- `NEXT_PUBLIC_APP_URL`

## Docs
- `docs/assumptions.md` — every assumption (export layout, tolerances,
  threshold, region, no-training)
- `docs/export-layout.md` — filing-software import CSV layout (assumption)
- `docs/limitations.md` — honest limits (no bounding boxes, free-tier AI not
  production-compliant, no HSN/duty, no filing portal)

## Out of scope
Customs portal filing, HSN classification/duty calculation, customer tracking
portal.
