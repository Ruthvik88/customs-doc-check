/**
 * Pure, deterministic cross-check functions for shipment documents.
 *
 * Each check returns { status: 'pass' | 'fail' | 'cannot_check' } plus the
 * two values compared, the delta, and the fields involved. "cannot_check"
 * means data is missing on one side -- it is explicitly NOT "pass".
 *
 * Inputs are normalised per-document views; callers (extraction/review
 * layer) map stored fields/line_items into this shape. No side effects, no
 * I/O, no randomness -- easy to unit test.
 */

import { validateContainers, iso6346Valid, normalizeContainer } from "./iso6346";

export type CheckStatus = "pass" | "fail" | "cannot_check";

export interface Line {
  description: string;
  hsn?: string | null;
  qty?: number | null;
  unitPrice?: number | null;
  lineTotal?: number | null;
}

export interface DocView {
  total?: number | null;
  currency?: string | null;
  incoterm?: string | null;
  supplier?: string | null;
  packages?: number | null;
  grossWeight?: number | null;
  containers?: string[];
  lines: Line[];
}

export interface CrossCheckInput {
  invoice: DocView;
  packingList: DocView;
  billOfLading: DocView;
  /** Fraction, e.g. 0.005 = 0.5%. Default 0.005. */
  weightTolerance?: number;
  /** Absolute currency tolerance for totals. Default 0.01. */
  totalTolerance?: number;
}

export interface CheckResult {
  check_type: string;
  status: CheckStatus;
  value_a: string | null;
  value_b: string | null;
  delta: string | null;
  fields_involved: string[];
  details: Record<string, unknown>;
}

const DEFAULT_WEIGHT_TOLERANCE = 0.005; // 0.5%
const DEFAULT_TOTAL_TOLERANCE = 0.01;

function result(
  check_type: string,
  status: CheckStatus,
  opts: {
    value_a?: string | null;
    value_b?: string | null;
    delta?: string | null;
    fields_involved?: string[];
    details?: Record<string, unknown>;
  } = {},
): CheckResult {
  return {
    check_type,
    status,
    value_a: opts.value_a ?? null,
    value_b: opts.value_b ?? null,
    delta: opts.delta ?? null,
    fields_involved: opts.fields_involved ?? [],
    details: opts.details ?? {},
  };
}

/** Parse a value that may include currency symbols, commas, spaces. */
function toNum(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const s = String(v);
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function fmtNum(n: number | null): string | null {
  if (n == null) return null;
  return n.toString();
}

function pctDelta(a: number, b: number): string | null {
  if (a == null || b == null || a === 0) return null;
  const pct = ((Math.abs(a - b) / Math.abs(a)) * 100).toFixed(2);
  return `${pct}%`;
}

/** All deterministic validators present? */
function allPresent(...vals: (number | null)[]): boolean {
  return vals.every((v) => v != null);
}

// ---------------------------------------------------------------------------
// 1a. Invoice total vs sum of line totals
// ---------------------------------------------------------------------------
export function invoiceTotalCheck(input: CrossCheckInput): CheckResult {
  const inv = input.invoice;
  const tol = input.totalTolerance ?? DEFAULT_TOTAL_TOLERANCE;
  const total = toNum(inv.total);
  const lines = inv.lines ?? [];
  if (total == null || lines.length === 0) {
    return result("invoice_total", "cannot_check", {
      value_a: inv.total != null ? String(inv.total) : null,
      value_b: lines.length ? String(lines.map((l) => l.lineTotal).filter(Boolean).reduce((a, b) => a + (b ?? 0), 0)) : null,
      fields_involved: ["invoice_total", "line_items[].line_total"],
      details: { reason: "missing invoice total or no line items" },
    });
  }
  const sum = lines.reduce((acc, l) => acc + (toNum(l.lineTotal) ?? 0), 0);
  const delta = Math.abs(sum - total);
  const pass = delta <= tol;
  return result("invoice_total", pass ? "pass" : "fail", {
    value_a: fmtNum(total),
    value_b: fmtNum(sum),
    delta: delta.toFixed(2),
    fields_involved: ["invoice_total", "line_items[].line_total"],
    details: { currency: inv.currency, tolerance: tol, line_count: lines.length },
  });
}

// ---------------------------------------------------------------------------
// 1b. Line total vs qty x unit price (per line)
// ---------------------------------------------------------------------------
export function lineItemMathCheck(input: CrossCheckInput): CheckResult {
  const lines = input.invoice.lines ?? [];
  const tol = input.totalTolerance ?? DEFAULT_TOTAL_TOLERANCE;
  if (lines.length === 0) {
    return result("line_item_math", "cannot_check", {
      fields_involved: ["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
      details: { reason: "no line items" },
    });
  }
  let failing = 0;
  let firstFail: { value_a: string | null; value_b: string | null; delta: string | null } | null = null;
  for (const l of lines) {
    const qty = toNum(l.qty);
    const unit = toNum(l.unitPrice);
    const total = toNum(l.lineTotal);
    if (!allPresent(qty, unit, total)) {
      // Missing data on a line means we cannot verify its math.
      return result("line_item_math", "cannot_check", {
        value_a: null,
        value_b: null,
        delta: "incomplete line data",
        fields_involved: ["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
        details: { reason: "incomplete line data", tolerance: tol },
      });
    }
    const expected = qty * unit;
    const delta = Math.abs(total - expected);
    if (delta > tol) {
      failing += 1;
      if (!firstFail) firstFail = { value_a: fmtNum(total), value_b: fmtNum(expected), delta: delta.toFixed(2) };
    }
  }
  const status = failing === 0 ? "pass" : "fail";
  return result("line_item_math", status, {
    value_a: firstFail?.value_a ?? null,
    value_b: firstFail?.value_b ?? null,
    delta: firstFail?.delta ?? null,
    fields_involved: ["line_items[].qty", "line_items[].unit_price", "line_items[].line_total"],
    details: { tolerance: tol, line_count: lines.length, failing_lines: failing },
  });
}

// ---------------------------------------------------------------------------
// 2. Line item quantities: invoice vs packing list (match by description/HSN,
//    handle reordered rows)
// ---------------------------------------------------------------------------
export function lineItemQtyCheck(input: CrossCheckInput): CheckResult {
  const invLines = input.invoice.lines ?? [];
  const plLines = input.packingList.lines ?? [];
  if (invLines.length === 0 || plLines.length === 0) {
    return result("line_item_qty", "cannot_check", {
      fields_involved: ["line_items[].qty"],
      details: { reason: "missing invoice or packing list lines" },
    });
  }
  const keyOf = (l: Line) => {
    const hsn = (l.hsn ?? "").trim();
    if (hsn) return `hsn:${hsn}`;
    return `desc:${normalizeText(l.description)}`;
  };
  const plByKey = new Map<string, Line>();
  for (const l of plLines) plByKey.set(keyOf(l), l);

  let failing = 0;
  let matched = 0;
  let unmatched: string[] = [];
  for (const inv of invLines) {
    const k = keyOf(inv);
    const pl = plByKey.get(k);
    if (!pl) {
      unmatched.push(inv.description);
      continue;
    }
    matched += 1;
    const a = toNum(inv.qty);
    const b = toNum(pl.qty);
    if (!allPresent(a, b) || a !== b) {
      failing += 1;
    }
  }
  const status = failing === 0 && matched === invLines.length ? "pass" : "fail";
  return result("line_item_qty", status, {
    value_a: String(invLines.length),
    value_b: String(matched),
    delta: failing > 0 ? `${failing} line(s) mismatch` : null,
    fields_involved: ["line_items[].description", "line_items[].hsn", "line_items[].qty"],
    details: {
      invoice_lines: invLines.length,
      matched_lines: matched,
      unmatched: unmatched,
      failing_lines: failing,
    },
  });
}

function normalizeText(s: string): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// 3. Total packages: packing list vs bill of lading (and invoice if present)
// ---------------------------------------------------------------------------
export function packagesCheck(input: CrossCheckInput): CheckResult {
  const values: { source: string; n: number | null }[] = [
    { source: "invoice", n: toNum(input.invoice.packages) },
    { source: "packing_list", n: toNum(input.packingList.packages) },
    { source: "bill_of_lading", n: toNum(input.billOfLading.packages) },
  ].filter((v) => v.n != null);
  if (values.length < 2) {
    return result("total_packages", "cannot_check", {
      fields_involved: ["packages"],
      details: { reason: "fewer than two documents report packages" },
    });
  }
  const first = values[0].n!;
  const inconsistent = values.filter((v) => v.n !== first);
  const status = inconsistent.length === 0 ? "pass" : "fail";
  const target = inconsistent[0];
  return result("total_packages", status, {
    value_a: fmtNum(first),
    value_b: target ? fmtNum(target.n) : null,
    delta: target && first != null && target.n != null ? String(Math.abs(first - target.n)) : null,
    fields_involved: ["packages"],
    details: { values: values.map((v) => ({ [v.source]: v.n })) },
  });
}

// ---------------------------------------------------------------------------
// 4. Gross weight: invoice vs packing list vs bill of lading
// ---------------------------------------------------------------------------
export function grossWeightCheck(input: CrossCheckInput): CheckResult {
  const tol = input.weightTolerance ?? DEFAULT_WEIGHT_TOLERANCE;
  const values: { source: string; n: number | null }[] = [
    { source: "invoice", n: toNum(input.invoice.grossWeight) },
    { source: "packing_list", n: toNum(input.packingList.grossWeight) },
    { source: "bill_of_lading", n: toNum(input.billOfLading.grossWeight) },
  ].filter((v) => v.n != null);
  if (values.length < 2) {
    return result("gross_weight", "cannot_check", {
      fields_involved: ["gross_weight_kg"],
      details: { reason: "fewer than two documents report gross weight", weight_tolerance: tol },
    });
  }
  let worstPct = 0;
  let worst: { a: number; b: number; pct: number } | null = null;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const a = values[i].n!;
      const b = values[j].n!;
      const ref = a === 0 ? b : a;
      const pct = ref === 0 ? 0 : (Math.abs(a - b) / Math.abs(ref)) * 100;
      if (pct > worstPct) {
        worstPct = pct;
        worst = { a, b, pct };
      }
    }
  }
  const pass = worstPct <= tol * 100;
  return result("gross_weight", pass ? "pass" : "fail", {
    value_a: worst ? fmtNum(worst.a) : null,
    value_b: worst ? fmtNum(worst.b) : null,
    delta: worst ? `${worstPct.toFixed(2)}%` : "0%",
    fields_involved: ["gross_weight_kg"],
    details: {
      weight_tolerance: tol,
      weight_tolerance_percent: tol * 100,
      values: values.map((v) => ({ [v.source]: v.n })),
      worst_pair_percent: worstPct.toFixed(2),
    },
  });
}

// ---------------------------------------------------------------------------
// 5. Container numbers: packing list vs bill of lading + ISO 6346 check digit
// ---------------------------------------------------------------------------
export function containerCheck(input: CrossCheckInput): CheckResult {
  const pl = (input.packingList.containers ?? []).map(normalizeContainer);
  const bl = (input.billOfLading.containers ?? []).map(normalizeContainer);
  if (pl.length === 0 && bl.length === 0) {
    return result("container_numbers", "cannot_check", {
      fields_involved: ["containers"],
      details: { reason: "no container numbers on either document" },
    });
  }
  const invalid = [...pl, ...bl].filter((c) => !iso6346Valid(c));
  const plSet = new Set(pl);
  const blSet = new Set(bl);
  const onlyPl = pl.filter((c) => !blSet.has(c));
  const onlyBl = bl.filter((c) => !plSet.has(c));
  const mismatch = onlyPl.length > 0 || onlyBl.length > 0;
  const status = mismatch || invalid.length > 0 ? "fail" : "pass";
  return result("container_numbers", status, {
    value_a: pl.length ? pl.join(", ") : null,
    value_b: bl.length ? bl.join(", ") : null,
    delta: (onlyPl.length + onlyBl.length + invalid.length) > 0 ? `${onlyPl.length + onlyBl.length} unmatched, ${invalid.length} invalid` : null,
    fields_involved: ["containers"],
    details: {
      only_in_packing_list: onlyPl,
      only_in_bill_of_lading: onlyBl,
      invalid_containers: invalid,
      validated: validateContainers([...pl, ...bl]),
    },
  });
}

// ---------------------------------------------------------------------------
// 6a. Currency and Incoterm consistency across documents
// ---------------------------------------------------------------------------
export function currencyIncotermCheck(input: CrossCheckInput): CheckResult {
  const docs = [
    { name: "invoice", v: input.invoice },
    { name: "packing_list", v: input.packingList },
    { name: "bill_of_lading", v: input.billOfLading },
  ];
  const currencies = docs.filter((d) => d.v.currency).map((d) => d.v.currency!);
  const incoterms = docs.filter((d) => d.v.incoterm).map((d) => d.v.incoterm!);
  const issues: string[] = [];
  if (currencies.length >= 2 && new Set(currencies).size > 1) {
    issues.push(`currency differs: ${currencies.join(", ")}`);
  }
  if (incoterms.length >= 2 && new Set(incoterms).size > 1) {
    issues.push(`incoterm differs: ${incoterms.join(", ")}`);
  }
  const present = currencies.length + incoterms.length;
  if (currencies.length < 2 && incoterms.length < 2) {
    return result("currency_incoterm", "cannot_check", {
      fields_involved: ["currency", "incoterm"],
      details: { reason: "insufficient documents report currency/incoterm" },
    });
  }
  const status = issues.length === 0 ? "pass" : "fail";
  return result("currency_incoterm", status, {
    value_a: currencies.length ? currencies.join(", ") : null,
    value_b: incoterms.length ? incoterms.join(", ") : null,
    delta: issues.length > 0 ? issues.join("; ") : null,
    fields_involved: ["currency", "incoterm"],
    details: { issues },
  });
}

// ---------------------------------------------------------------------------
// 6b. Supplier name consistency across documents (normalised fuzzy match)
// ---------------------------------------------------------------------------
export function supplierConsistencyCheck(input: CrossCheckInput): CheckResult {
  const docs = [
    { name: "invoice", v: input.invoice },
    { name: "packing_list", v: input.packingList },
    { name: "bill_of_lading", v: input.billOfLading },
  ];
  const names = docs.filter((d) => d.v.supplier).map((d) => d.v.supplier!);
  if (names.length < 2) {
    return result("supplier_consistency", "cannot_check", {
      fields_involved: ["supplier"],
      details: { reason: "fewer than two documents report a supplier" },
    });
  }
  const normalized = names.map(normalizeText);
  const allSame = normalized.every((n) => n === normalized[0]);
  // fallback fuzzy: token overlap >= 0.85
  let fuzzy = allSame;
  if (!allSame && normalized.length >= 2) {
    const tokens = (s: string) => new Set(s.split(/\s+/).filter(Boolean));
    const t0 = tokens(normalized[0]);
    const overlap = normalized.slice(1).every((n) => {
      const t = tokens(n);
      const inter = [...t0].filter((x) => t.has(x)).length;
      const union = new Set([...t0, ...t]).size;
      return union > 0 ? inter / union >= 0.85 : true;
    });
    fuzzy = overlap;
  }
  const status = fuzzy ? "pass" : "fail";
  return result("supplier_consistency", status, {
    value_a: names[0] ?? null,
    value_b: names[1] ?? null,
    delta: fuzzy ? null : "names differ after normalisation",
    fields_involved: ["supplier"],
    details: { names, normalized, all_same: allSame, fuzzy_match: fuzzy },
  });
}

// ---------------------------------------------------------------------------
// Aggregate: run every check
// ---------------------------------------------------------------------------
export function runAllCrossChecks(input: CrossCheckInput): CheckResult[] {
  return [
    invoiceTotalCheck(input),
    lineItemMathCheck(input),
    lineItemQtyCheck(input),
    packagesCheck(input),
    grossWeightCheck(input),
    containerCheck(input),
    currencyIncotermCheck(input),
    supplierConsistencyCheck(input),
  ];
}

export function unresolvedFailed(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => r.status === "fail");
}

export function hasUnresolvedFailed(results: CheckResult[]): boolean {
  return results.some((r) => r.status === "fail");
}

export function fieldsNeedingReview(results: CheckResult[]): string[] {
  const keys = new Set<string>();
  for (const r of results) {
    if (r.status === "fail") {
      for (const f of r.fields_involved) keys.add(f);
    }
  }
  return [...keys];
}
