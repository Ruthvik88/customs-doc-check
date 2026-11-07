#!/usr/bin/env node
/**
 * scripts/live-extract-eval.ts
 *
 * Runs LIVE Gemini extraction on every seed PDF, compares the extracted
 * fields against the ground-truth cached extraction JSON, and writes
 * per-field accuracy to docs/eval-results.md.
 *
 * Requires: GEMINI_API_KEY and GEMINI_MODEL env vars, EXTRACTION_MODE=live.
 * Reads PDFs from data/seeds/<shipment_number>/<type>.pdf and ground truth
 * from data/seeds/cache/<shipment_number>/<type>.json.
 *
 * Run: npx tsx scripts/live-extract-eval.ts
 */

import * as fs from "fs";
import * as path from "path";
import { extractDocument } from "../lib/extraction";

const SEED_DIR = path.join(process.cwd(), "data", "seeds");
const CACHE_DIR = path.join(SEED_DIR, "cache");
const OUT_FILE = path.join(process.cwd(), "docs", "eval-results.md");

const DOC_TYPES: ("invoice" | "packing_list" | "bill_of_lading")[] = [
  "invoice",
  "packing_list",
  "bill_of_lading",
];

// Fields to compare per document type (key -> ground truth accessor).
const COMPARE_FIELDS: Record<string, (json: any) => any> = {
  invoice: (j) => ({
    supplier: j.supplier?.value,
    consignee: j.consignee?.value,
    invoice_number: j.invoice_number?.value,
    invoice_date: j.invoice_date?.value,
    currency: j.currency?.value,
    incoterm: j.incoterm?.value,
    invoice_total: j.invoice_total?.value,
    packages: j.packages?.value,
    gross_weight_kg: j.gross_weight_kg?.value,
    net_weight_kg: j.net_weight_kg?.value,
    bl_number: j.bl_number?.value,
    vessel: j.vessel?.value,
    port_of_loading: j.port_of_loading?.value,
    port_of_discharge: j.port_of_discharge?.value,
    containers: j.containers?.join(", "),
  }),
  packing_list: (j) => ({
    supplier: j.supplier?.value,
    consignee: j.consignee?.value,
    packages: j.packages?.value,
    gross_weight_kg: j.gross_weight_kg?.value,
    net_weight_kg: j.net_weight_kg?.value,
    containers: j.containers?.join(", "),
  }),
  bill_of_lading: (j) => ({
    bl_number: j.bl_number?.value,
    vessel: j.vessel?.value,
    port_of_loading: j.port_of_loading?.value,
    port_of_discharge: j.port_of_discharge?.value,
    supplier: j.supplier?.value,
    consignee: j.consignee?.value,
    packages: j.packages?.value,
    gross_weight_kg: j.gross_weight_kg?.value,
    containers: j.containers?.join(", "),
  }),
};

function normalize(v: any): string {
  if (v == null) return "";
  return String(v).trim().toLowerCase();
}

function match(extracted: any, ground: any): boolean {
  return normalize(extracted) === normalize(ground);
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY not set. Set it and re-run.");
    process.exit(1);
  }
  process.env.EXTRACTION_MODE = "live";

  const manifestPath = path.join(SEED_DIR, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const results: Array<{
    shipment: string;
    document: string;
    field: string;
    extracted: string;
    ground_truth: string;
    match: boolean;
  }> = [];

  let totalFields = 0;
  let matchedFields = 0;

  for (const shipment of manifest) {
    const shipmentNumber = shipment.shipment_number;
    console.log(`Evaluating ${shipmentNumber}...`);

    for (const docType of DOC_TYPES) {
      const pdfPath = shipment[`${docType}_pdf` as keyof typeof shipment];
      if (!pdfPath || !fs.existsSync(pdfPath)) continue;

      const cacheFile = path.join(CACHE_DIR, shipmentNumber, `${docType}.json`);
      if (!fs.existsSync(cacheFile)) continue;

      const groundTruth = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      const fileBuffer = fs.readFileSync(pdfPath);
      const mimeType = "application/pdf";

      let result;
      try {
        result = await extractDocument({
          documentType: docType,
          fileBuffer,
          mimeType,
        });
      } catch (err) {
        console.error(`  ${docType}: extraction error:`, err);
        continue;
      }

      if (result.status !== "extracted") {
        console.log(`  ${docType}: status=${result.status} (${result.error})`);
        continue;
      }

      const gt = COMPARE_FIELDS[docType](groundTruth);
      const fields = result.fields as Array<{ key: string; value: any }>;

      for (const [fieldKey, groundValue] of Object.entries(gt)) {
        const field = fields.find((f) => f.key === fieldKey);
        const extractedValue = field?.value ?? null;
        const isMatch = match(extractedValue, groundValue);
        totalFields++;
        if (isMatch) matchedFields++;
        results.push({
          shipment: shipmentNumber,
          document: docType,
          field: fieldKey,
          extracted: String(extractedValue ?? ""),
          ground_truth: String(groundValue ?? ""),
          match: isMatch,
        });
      }
    }
  }

  // Write results.
  const overallAccuracy = totalFields > 0 ? (matchedFields / totalFields) * 100 : 0;

  // Per-field accuracy grouped by field key.
  const byField: Record<string, { total: number; matched: number }> = {};
  for (const r of results) {
    const acc = byField[r.field] ?? { total: 0, matched: 0 };
    acc.total++;
    if (r.match) acc.matched++;
    byField[r.field] = acc;
  }

  const lines: string[] = [];
  lines.push("# Live Extraction Evaluation Results");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Model: ${process.env.GEMINI_MODEL}`);
  lines.push(`Mode: live (Gemini API calls)`);
  lines.push("");
  lines.push(`## Overall Accuracy`);
  lines.push("");
  lines.push(`- Total fields compared: ${totalFields}`);
  lines.push(`- Fields matched: ${matchedFields}`);
  lines.push(`- Overall accuracy: ${overallAccuracy.toFixed(1)}%`);
  lines.push("");
  lines.push("## Per-Field Accuracy");
  lines.push("");
  lines.push("| Field | Total | Matched | Accuracy |");
  lines.push("|-------|-------|---------|----------|");
  for (const [field, acc] of Object.entries(byField).sort((a, b) => a[0].localeCompare(b[0]))) {
    const pct = (acc.matched / acc.total) * 100;
    lines.push(`| ${field} | ${acc.total} | ${acc.matched} | ${pct.toFixed(1)}% |`);
  }
  lines.push("");
  lines.push("## Mismatches");
  lines.push("");
  const mismatches = results.filter((r) => !r.match);
  if (mismatches.length === 0) {
    lines.push("None — all fields matched ground truth.");
  } else {
    lines.push("| Shipment | Document | Field | Extracted | Ground Truth |");
    lines.push("|----------|----------|-------|-----------|--------------|");
    for (const r of mismatches) {
      lines.push(`| ${r.shipment} | ${r.document} | ${r.field} | ${r.extracted} | ${r.ground_truth} |`);
    }
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("- Accuracy is exact string match after trimming and lowercasing.");
  lines.push("- Ground truth is the cached extraction JSON (seed data), not the");
  lines.push("  original PDF text, so OCR/vision discrepancies against the seed are");
  lines.push("  reported as mismatches.");
  lines.push("- Free-tier Gemini results vary; treat these numbers as indicative,");
  lines.push("  not authoritative.");

  fs.writeFileSync(OUT_FILE, lines.join("\n") + "\n");
  console.log(`\nEvaluation complete. Overall accuracy: ${overallAccuracy.toFixed(1)}%`);
  console.log(`Results written to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("Evaluation failed:", err);
  process.exit(1);
});
