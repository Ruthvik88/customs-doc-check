# Graph Report - customs-doc-check  (2026-11-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 376 nodes · 737 edges · 23 communities (13 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3a25d9b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seed.py
- extraction.ts
- extract/route.ts
- dashboard/page.tsx
- crosschecks.ts
- export-gating.test.ts
- compilerOptions
- dependencies
- devDependencies
- package.json
- crosscheck-results.test.ts
- .eslintrc.json
- scripts
- eslint-config-next@15.0.0
- eslint-plugin-react-hooks@^5.2.0
- supabase@^3.0.0
- tailwindcss@^3.4.0
- @types/node@^20.0.0
- typescript@^5.6.0

## God Nodes (most connected - your core abstractions)
1. `load_into_supabase()` - 16 edges
2. `next` - 16 edges
3. `compilerOptions` - 16 edges
4. `generate()` - 14 edges
5. `requireSupabaseClient()` - 14 edges
6. `vitest` - 13 edges
7. `requireServiceRoleClient()` - 12 edges
8. `useSession()` - 12 edges
9. `runAllCrossChecks()` - 12 edges
10. `react` - 12 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `runAllCrossChecks()`  [EXTRACTED]
  app/api/crosschecks/[shipmentId]/route.ts → lib/crosschecks.ts
- `ReportsPage()` --calls--> `createClient()`  [EXTRACTED]
  app/(app)/reports/page.tsx → lib/supabase/server.ts
- `RootPage()` --calls--> `useSession()`  [EXTRACTED]
  app/page.tsx → hooks/useSession.ts
- `mk()` --calls--> `containerCheckDigit()`  [EXTRACTED]
  tests/iso6346.test.ts → lib/iso6346.ts
- `extractOne()` --calls--> `extractDocument()`  [EXTRACTED]
  app/api/extract/route.ts → lib/extraction.ts

## Import Cycles
- None detected.

## Communities (23 total, 10 thin omitted)

### Community 0 - "seed.py"
Cohesion: 0.06
Nodes (36): bl_extraction(), _cc_doc_view(), _cc_iso6346_valid(), _cc_normalize_text(), _cc_result(), _cc_to_num(), compute_crosschecks(), container_check_digit() (+28 more)

### Community 1 - "extraction.ts"
Cohesion: 0.06
Nodes (42): extractOne(), writeExtraction(), clamp(), combineConfidence(), ConfidenceInputs, ConfidenceOutput, DEFAULT_CONFIDENCE_THRESHOLD, needsReview() (+34 more)

### Community 2 - "extract/route.ts"
Cohesion: 0.10
Nodes (32): docViewFrom(), POST(), toNum(), GET(), POST(), BodySchema, dynamic, maxDuration (+24 more)

### Community 3 - "dashboard/page.tsx"
Cohesion: 0.12
Nodes (30): DashboardPage(), dynamic, STATUS_COLOR, statusVariant(), ExportPage(), exportShipment(), load(), AppLayout() (+22 more)

### Community 4 - "crosschecks.ts"
Cohesion: 0.15
Nodes (31): allPresent(), CheckStatus, containerCheck(), CrossCheckInput, currencyIncotermCheck(), DocView, fieldsNeedingReview(), fmtNum() (+23 more)

### Community 5 - "export-gating.test.ts"
Cohesion: 0.07
Nodes (23): AUTHED_ROUTES, config, middleware(), PUBLIC_ROUTES, @supabase/ssr@^0.4.0, vitest@^2.0.0, @supabase/ssr, vitest (+15 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, clsx@^2.1.0, @google/genai@^1.0.0, lucide-react@^1.70.0, next@15.0.0, react@^18.2.0, react-dom@^18.2.0, @supabase/supabase-js@^2.45.0 (+7 more)

### Community 8 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer@^10.4.0, eslint@^8.0.0, postcss@^8.4.0, @testing-library/react@^16.0.0, @testing-library/user-event@^14.0.0, @types/react@^18.0.0, autoprefixer (+5 more)

### Community 9 - "package.json"
Cohesion: 0.22
Nodes (8): description, jsdom@^24.0.0, @types/react-dom@^18.0.0, name, private, version, jsdom, @types/react-dom

### Community 10 - "crosscheck-results.test.ts"
Cohesion: 0.36
Nodes (6): ExistingCrosscheck, mergeCrosscheckResolution(), semanticEqual(), CheckResult, resolved, result

### Community 11 - ".eslintrc.json"
Cohesion: 0.29
Nodes (6): extends, plugins, rules, react-hooks/exhaustive-deps, react-hooks/rules-of-hooks, next/core-web-vitals

### Community 12 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test, test:watch

## Knowledge Gaps
- **2 isolated node(s):** `next/core-web-vitals`, `RFC-4180`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 131 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `extract/route.ts` to `package.json`, `dashboard/page.tsx`, `export-gating.test.ts`, `dependencies`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `RFC-4180` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `seed.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05827505827505827 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `export-gating.test.ts` to `extraction.ts`, `extract/route.ts`, `crosschecks.ts`, `package.json`, `crosscheck-results.test.ts`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Should `extraction.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05957767722473605 - nodes in this community are weakly interconnected._
- **Why does `react` connect `dashboard/page.tsx` to `package.json`, `dependencies`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `extract/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10241545893719807 - nodes in this community are weakly interconnected._