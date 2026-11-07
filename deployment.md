# Deployment

## Prerequisites
- Node.js (18+) and npm
- A Supabase project (region: ap-south-1)
- A Gemini API key and model name (`GEMINI_MODEL`)

## 1. Supabase setup
1. Create a Supabase project in region **ap-south-1**.
2. Apply the schema to the database (SQL editor or Supabase CLI):
   ```
   psql -f database/schema.sql
   ```
   or paste `database/schema.sql` into the Supabase SQL Editor.

   **Fresh vs existing databases:** on a fresh database run `database/schema.sql`
   only. On an existing database that already has the older schema applied, do
   not re-run `schema.sql` (it will fail on already-existing objects); instead
   run the idempotent migration `database/migrations/002_exec_status_policy_and_supplier_unique.sql`,
   which applies only the two fixes (executive status restriction on the
   update policy, and the unique constraint on `suppliers.name`).
3. Create a private Storage bucket named `documents` (files served via
   short-lived signed URLs).
4. Seed demo users and data:
   - Create the two Auth users (email/password):
     - `exec@demo.local` / `exec@demo.local` → role `documentation_executive`
     - `manager@demo.local` / `manager@demo.local` → role
       `documentation_manager`
   - Set their `app_metadata.role` via the service-role client (not
     `user_metadata`, which is user-editable).
   - Insert `profiles` rows for both users.
   - Optionally run `python scripts/seed.py --load` to load suppliers,
     shipments, documents, fields, line items and cross-checks into Supabase,
     and upload the seed PDFs to the private `documents` bucket.
     Seed PDFs and cached JSON are already committed under `data/seeds/`;
     Python is only needed to (re)load or regenerate them.

   **Windows PowerShell setup for `scripts/seed.py --load`:**

   ```powershell
   # 1. Install the Python dependencies (supabase client + dotenv).
   pip install -r requirements.txt

   # 2. Create .env.local at the project root with the required values
   #    (never commit real secrets; .env.local is gitignored).
   #    Copy from .env.example and fill in:
   #      SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
   #      SUPABASE_SERVICE_ROLE_KEY
   #      DEMO_PASSWORD   (optional; random if unset)
   #    seed.py reads .env.local first, then .env.

   # 3. Run the load (idempotent: safe to repeat).
   python scripts/seed.py --load

   # To force regeneration of the committed PDFs/cached JSON:
   #   python scripts/seed.py --regenerate --load
   ```

   **Skewed-scan test asset:** `data/seeds/SHP-24815/invoice_scan.png` is a skewed,
   blurred scan used for manual testing. `scripts/seed.py --load` does NOT upload
   it or create a document row for it (`documents_type_check` allows only
   `invoice`, `packing_list`, `bill_of_lading`). To test the skewed-scan flow,
   upload `invoice_scan.png` to the private `documents` bucket manually and add it
   as an extra test case in `scripts/live-extract-eval.ts`.

## 2. Environment variables
Create `.env` (gitignored) with values for the names listed in
`.env.example`. Never commit real secrets.

Required names:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `EXTRACTION_MODE` (`cached` for demos, `live` for new uploads)
- `CONFIDENCE_THRESHOLD` (default `0.80`)
- `WEIGHT_TOLERANCE` (default `0.005`)
- `MAX_UPLOAD_SIZE` (default `10485760`)
- `NEXT_PUBLIC_APP_URL`

## 3. Deploy to Vercel
1. Push this repo to GitHub/GitLab.
2. Import the project in Vercel (framework preset: Next.js).
3. Add the environment variables from `.env` (names only — values from your
   sealed config).
4. Set the Build Command to `npm run build` and Output Directory to `.next`.
5. Deploy. Verify `/login` works with the demo credentials.

### Note on function duration
The extraction route sets `maxDuration = 300`. Vercel Hobby plans cap serverless
function duration at 60s. For live extractions use a Vercel Pro plan, or keep
`EXTRACTION_MODE=cached` (demo) where extraction reads committed JSON and is
fast.

## Local development
```bash
npm install
cp .env.example .env   # fill in values
npm run dev            # http://localhost:3000
npm test               # Vitest unit tests
```

## Demo logins
| Role | Email | Password |
|---|---|---|
| Documentation executive | exec@demo.local | Set via DEMO_PASSWORD env var when running `scripts/seed.py --load` |
| Documentation manager | manager@demo.local | Same as executive |
