# Assumptions

Every assumption made while building this MVP is listed here, so they can be
revisited when a real customs broker adopts the tool.

## Export layout
A filing-software import layout had to be assumed because no real customs
software was specified. It is defined in `/docs/export-layout.md` and is
clearly labelled as an assumption: one CSV row per shipment, UTF-8, CRLF,
comma-delimited, reconciled values, with standard CSV quoting. The column
mapping can be re-pointed in `app/api/export/route.ts` when a real target
layout is known.

## Tolerances
- Weight cross-check tolerance: 0.5% (configurable via `WEIGHT_TOLERANCE`).
  Seed example: SHP-24811 invoice 3120 kg vs packing list 3165 kg = 1.44%,
  which exceeds tolerance and must flag.
- Invoice total vs line-sum tolerance: 0.01 in invoice currency
  (configurable via `TOTAL_TOLERANCE`).

## Confidence threshold
Default review threshold is 0.80 (configurable via `CONFIDENCE_THRESHOLD`).
Fields below threshold, or involved in a failed cross-check, become
`needs_review` and must be confirmed or edited by a person before export.

## AI / provider
- Provider: Google Gemini via `@google/genai`, model name from `GEMINI_MODEL`.
- No model training, fine-tuning, or provider-specific features are used.
  Prompts are generic; switching providers only requires rewriting the
  extraction service (`lib/extraction.ts`).
- Free-tier AI is explicitly not production-compliant (see limitations).
- Structured output is requested via `responseMimeType: application/json` plus
  `responseSchema`; the response is validated with Zod.

## Cached mode (demo)
`EXTRACTION_MODE=cached` returns pre-saved extraction JSON for the seeded
shipments, so demos never depend on live API calls or API keys. Live mode
calls Gemini for new uploads. Seed PDFs and cached JSON are committed under
`data/seeds/`; Python is only needed to regenerate them.

## Hosting region
Supabase project region: ap-south-1 (Mumbai), matching the broker's location
at Nhava Sheva. Next.js app deployable on Vercel.

## Roles & access
- Two roles: `documentation_executive` and `documentation_manager`.
- Only the manager can approve or export.
- Role is resolved server-side by the `current_app_role()` security-definer
  function reading `profiles.role` (never `user_metadata`, which is
  user-editable).

## Personal data
Importer contacts are personal data under the DPDP Act 2023. They are stored
minimally (name/address only) and no real people are seeded. All companies
and people in the seed data are fictional.

## Out of scope (not built)
- Customs portal filing, HSN classification, duty calculation.
- Customer tracking portal.
- Bounding-box highlighting on documents (vision-model boxes are unreliable;
  page-level source reference is provided instead).

## Seed data
11 fictional shipments across statuses (Draft, Extracting, Needs review, Ready
for approval, Approved, Exported), including: a weight mismatch (SHP-24811),
an invoice total mismatch (SHP-24814), a skewed/scanned invoice (SHP-24815),
a bilingual invoice (SHP-24816), a missing bill of lading (SHP-24817), and
clean shipments (SHP-24812, SHP-24813, SHP-24818–SHP-24821).
