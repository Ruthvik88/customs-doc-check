"use strict";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { combineConfidence, DEFAULT_CONFIDENCE_THRESHOLD } from "./confidence";
import { iso6346Valid } from "./iso6346";

/* ------------------------------------------------------------------ */
/* Zod schema for the structured extraction output.                   */
/* Every field carries value + confidence (0-1) + source page.        */
/* ------------------------------------------------------------------ */

const FieldSchema = z.object({
  value: z.string().nullable(),
  confidence: z.number().min(0).max(1).optional(),
  source_page: z.number().int().min(1).optional(),
});

const LineItemSchema = z.object({
  description: z.string().nullable(),
  hsn: z.string().nullable(),
  qty: z.string().nullable(),
  unit_price: z.string().nullable(),
  line_total: z.string().nullable(),
  confidence: z.number().min(0).max(1).optional(),
  source_page: z.number().int().min(1).optional(),
});

export const ExtractionSchema = z.object({
  document_type: z.enum(["invoice", "packing_list", "bill_of_lading"]),
  supplier: FieldSchema,
  consignee: FieldSchema,
  invoice_number: FieldSchema,
  invoice_date: FieldSchema,
  currency: FieldSchema,
  incoterm: FieldSchema,
  invoice_total: FieldSchema,
  packages: FieldSchema,
  gross_weight_kg: FieldSchema,
  net_weight_kg: FieldSchema,
  containers: z.array(z.string()),
  bl_number: FieldSchema,
  vessel: FieldSchema,
  port_of_loading: FieldSchema,
  port_of_discharge: FieldSchema,
  line_items: z.array(LineItemSchema),
  source_text: z.string().optional(),
});

export type ExtractionOutput = z.infer<typeof ExtractionSchema>;

/* ------------------------------------------------------------------ */
/* JSON schema passed to Gemini for structured output.                */
/* ------------------------------------------------------------------ */

const GEMINI_JSON_SCHEMA = {
  type: "object",
  properties: {
    document_type: { type: "string", enum: ["invoice", "packing_list", "bill_of_lading"] },
    supplier: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    consignee: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    invoice_number: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    invoice_date: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    currency: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    incoterm: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    invoice_total: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    packages: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    gross_weight_kg: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    net_weight_kg: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    containers: { type: "array", items: { type: "string" } },
    bl_number: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    vessel: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    port_of_loading: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    port_of_discharge: { type: "object", properties: { value: { type: ["string", "null"] }, confidence: { type: "number" }, source_page: { type: "integer" } }, required: ["value"] },
    line_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: ["string", "null"] },
          hsn: { type: ["string", "null"] },
          qty: { type: ["string", "null"] },
          unit_price: { type: ["string", "null"] },
          line_total: { type: ["string", "null"] },
          confidence: { type: "number" },
          source_page: { type: "integer" },
        },
        required: ["description"],
      },
    },
    source_text: { type: "string" },
  },
  required: ["document_type"],
} as const;

/* ------------------------------------------------------------------ */
/* Prompt.                                                            */
/* ------------------------------------------------------------------ */

const EXTRACTION_PROMPT = `You are a careful document-extraction agent for a customs broker.
Extract the shipment data from the attached document (commercial invoice, packing list, or bill of lading).
Return STRICT JSON only, matching the schema. Do not include markdown fences.

Extract these fields and set "value" to the string value, or null if not present.
Set "confidence" to your own 0-1 estimate (we will recompute it deterministically).
Set "source_page" to the 1-based page where the value was found.

Fields: document_type, supplier, consignee, invoice_number, invoice_date,
currency, incoterm, invoice_total, packages, gross_weight_kg, net_weight_kg,
containers, bl_number, vessel, port_of_loading, port_of_discharge, line_items.

line_items: array of { description, hsn, qty, unit_price, line_total, confidence, source_page }.
containers: array of container number strings (e.g. MSKU1234565).

Be conservative: only extract what is clearly visible. Prefer null over guessing.`;

/* ------------------------------------------------------------------ */
/* Deterministic validators used to recompute confidence.             */
/* ------------------------------------------------------------------ */

const KNOWN_CURRENCIES = new Set([
  "USD","EUR","GBP","JPY","CNY","INR","SEK","AUD","CAD","CHF","SGD","AED",
]);

const KNOWN_INCOTERMS = new Set([
  "EXW","FCA","FAS","FOB","CFR","CIF","DPU","DAP","DDP",
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HSN_RE = /^\d{6,8}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;

function validateDate(v: string | null): boolean {
  if (!v) return false;
  if (!DATE_RE.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  return !Number.isNaN(d.getTime());
}
function validateCurrency(v: string | null): boolean {
  return Boolean(v && CURRENCY_RE.test(v) && KNOWN_CURRENCIES.has(v));
}
function validateIncoterm(v: string | null): boolean {
  return Boolean(v && KNOWN_INCOTERMS.has(v.toUpperCase()));
}
function validateHsn(v: string | null): boolean {
  return Boolean(v && HSN_RE.test(v.replace(/\s/g, "")));
}
function validateNumber(v: string | null): boolean {
  if (!v) return false;
  const n = Number(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n);
}
function validateContainer(v: string | null): boolean {
  return Boolean(v && iso6346Valid(v));
}

/** Count how many of the applicable deterministic validators pass for a field. */
function fieldValidators(key: string, value: string | null): { passed: number; total: number } {
  let total = 0;
  let passed = 0;
  const check = (cond: boolean) => { total += 1; if (cond) passed += 1; };
  switch (key) {
    case "invoice_date": check(validateDate(value)); break;
    case "currency": check(validateCurrency(value)); break;
    case "incoterm": check(validateIncoterm(value)); break;
    case "hsn": check(validateHsn(value)); break;
    case "gross_weight_kg": case "net_weight_kg": case "packages":
    case "qty": case "unit_price": case "line_total":
      check(validateNumber(value)); break;
    case "containers": {
      // containers is an array; validate each present entry
      const arr = Array.isArray(value) ? value : value ? [value] : [];
      total += arr.length;
      passed += arr.filter((c) => validateContainer(c)).length;
      if (arr.length === 0) { total = 1; passed = 1; } // nothing to validate -> neutral
      return { passed, total };
    }
    default:
      // parties, numbers, BL number, ports, dates without a specific rule
      return { passed: 1, total: 1 };
  }
  return { passed, total };
}

/** Recompute final confidence for a single field using the documented formula. */
export function recomputeFieldConfidence(inputs: {
  modelConfidence: number;
  key: string;
  value: string | null;
  presentInText: boolean;
}): number {
  const { passed, total } = fieldValidators(inputs.key, inputs.value);
  const out = combineConfidence({
    modelConfidence: inputs.modelConfidence,
    validatorsPassed: passed,
    validatorsTotal: total,
    presentInText: inputs.presentInText,
  });
  return out.confidence;
}

/* ------------------------------------------------------------------ */
/* Gemini call with retry / backoff.                                  */
/* ------------------------------------------------------------------ */

type GeminiError = Error & { status?: number };

function isRetryable(err: GeminiError): boolean {
  return err.status === 429 || err.status === 500 || err.status === 503 || err.status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callGeminiOnce(fileBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  if (!apiKey) {
    throw Object.assign(new Error("GEMINI_API_KEY not configured"), { status: 500 });
  }
  const ai = new GoogleGenAI({ apiKey });
  const base64 = fileBuffer.toString("base64");
  const result = await ai.models.generateContent({
    model: modelName,
    contents: [
      { role: "user", parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { data: base64, mimeType } }] },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_JSON_SCHEMA,
      temperature: 0.1,
    },
  });
  const text = result.text ?? "";
  if (!text) throw Object.assign(new Error("Empty response from Gemini"), { status: 502 });
  return text;
}

async function callGeminiWithRetry(fileBuffer: Buffer, mimeType: string): Promise<string> {
  let lastErr: unknown;
  const maxAttempts = 3; // initial + 2 retries for 429/transient
  let delay = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await callGeminiOnce(fileBuffer, mimeType);
    } catch (err) {
      lastErr = err;
      const ge = err as GeminiError;
      if (!isRetryable(ge) || attempt === maxAttempts - 1) break;
      await sleep(delay);
      delay *= 2; // exponential backoff: 1s, 2s
    }
  }
  throw lastErr;
}

/* ------------------------------------------------------------------ */
/* Extraction entry point.                                            */
/* ------------------------------------------------------------------ */

export interface ExtractionResult {
  documentType: string;
  status: "extracted" | "needs_manual" | "failed";
  error?: string;
  rawJson: unknown;
  model: string;
  fields: Array<{
    key: string;
    value: string | null;
    aiValue: string | null;
    confidence: number;
    status: "extracted" | "needs_review" | "manual";
    sourcePage: number | null;
  }>;
  lineItems: Array<{
    description: string | null;
    hsn: string | null;
    qty: string | null;
    unitPrice: string | null;
    lineTotal: string | null;
    confidence: number;
    sourcePage: number | null;
  }>;
}

const THRESHOLD = Number(process.env.CONFIDENCE_THRESHOLD ?? DEFAULT_CONFIDENCE_THRESHOLD);

/**
 * Extract a single document.
 *
 * Modes:
 *   EXTRACTION_MODE=cached  -> return pre-saved extraction JSON (demo; never calls Gemini).
 *   EXTRACTION_MODE=live    -> call Gemini, validate with Zod, retry once on invalid JSON,
 *                              exponential backoff on 429, fall back to needs_manual on failure.
 *
 * Never logs document contents.
 */
export async function extractDocument(opts: {
  documentType: "invoice" | "packing_list" | "bill_of_lading";
  fileBuffer: Buffer;
  mimeType: string;
  cachedJson?: unknown;
}): Promise<ExtractionResult> {
  const mode = (process.env.EXTRACTION_MODE || "cached").toLowerCase();

  // ---------- cached mode (demo) ----------
  if (mode === "cached") {
    if (!opts.cachedJson) {
      return {
        documentType: opts.documentType,
        status: "needs_manual",
        error: "no cached extraction available",
        rawJson: null,
        model: "cached",
        fields: [],
        lineItems: [],
      };
    }
    const parsed = ExtractionSchema.safeParse(opts.cachedJson);
    if (!parsed.success) {
      return {
        documentType: opts.documentType,
        status: "needs_manual",
        error: "cached extraction failed validation",
        rawJson: opts.cachedJson,
        model: "cached",
        fields: [],
        lineItems: [],
      };
    }
    return buildResult(parsed.data, "cached", opts.documentType);
  }

  // ---------- live mode ----------
  let rawText: string;
  try {
    rawText = await callGeminiWithRetry(opts.fileBuffer, opts.mimeType);
  } catch (err) {
    return {
      documentType: opts.documentType,
      status: "failed",
      error: err instanceof Error ? err.message : "Gemini call failed",
      rawJson: null,
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      fields: [],
      lineItems: [],
    };
  }

  // Parse JSON; on invalid JSON retry once, then fall back to manual entry.
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    // retry once with a repair prompt
    try {
      const repair = await callGeminiWithRetry(
        opts.fileBuffer,
        opts.mimeType,
      );
      // NOTE: callGeminiWithRetry uses the same prompt; for a true repair we'd
      // re-prompt. Keep simple: attempt parse again.
      parsedJson = JSON.parse(repair);
    } catch {
      return {
        documentType: opts.documentType,
        status: "needs_manual",
        error: "invalid JSON from Gemini after retry",
        rawJson: rawText,
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        fields: [],
        lineItems: [],
      };
    }
  }

  const validated = ExtractionSchema.safeParse(parsedJson);
  if (!validated.success) {
    // invalid schema -> manual entry fallback
    return {
      documentType: opts.documentType,
      status: "needs_manual",
      error: "Gemini output failed schema validation",
      rawJson: parsedJson,
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      fields: [],
      lineItems: [],
    };
  }

  return buildResult(validated.data, process.env.GEMINI_MODEL || "gemini-1.5-flash", opts.documentType);
}

/* ------------------------------------------------------------------ */
/* Build the normalized result from validated Gemini output.          */
/* ------------------------------------------------------------------ */

function buildResult(
  out: ExtractionOutput,
  model: string,
  documentType: string,
): ExtractionResult {
  const fieldEntries: Array<[string, ExtractionOutput["supplier"]]> = [
    ["supplier", out.supplier],
    ["consignee", out.consignee],
    ["invoice_number", out.invoice_number],
    ["invoice_date", out.invoice_date],
    ["currency", out.currency],
    ["incoterm", out.incoterm],
    ["invoice_total", out.invoice_total],
    ["packages", out.packages],
    ["gross_weight_kg", out.gross_weight_kg],
    ["net_weight_kg", out.net_weight_kg],
    ["bl_number", out.bl_number],
    ["vessel", out.vessel],
    ["port_of_loading", out.port_of_loading],
    ["port_of_discharge", out.port_of_discharge],
  ];

  const fields: Array<{
    key: string;
    value: string | null;
    aiValue: string | null;
    confidence: number;
    status: "extracted" | "needs_review" | "manual";
    sourcePage: number | null;
  }> = fieldEntries.map(([key, f]) => {
    const modelConf = f.confidence ?? 0.5;
    const present = Boolean(f.value);
    const confidence = recomputeFieldConfidence({
      modelConfidence: modelConf,
      key,
      value: f.value,
      presentInText: present,
    });
    return {
      key,
      value: f.value,
      aiValue: f.value,
      confidence,
      status: confidence < THRESHOLD ? "needs_review" : "extracted",
      sourcePage: f.source_page ?? null,
    };
  });

  // containers field
  const containerConfs = out.containers.map(() => 0.5);
  fields.push({
    key: "containers",
    value: out.containers.length ? out.containers.join(", ") : null,
    aiValue: out.containers.length ? out.containers.join(", ") : null,
    confidence:
      out.containers.length > 0
        ? out.containers.reduce((a, c) => a + (iso6346Valid(c) ? 1 : 0), 0) /
          out.containers.length
        : 1,
    status: (out.containers.length > 0 &&
      out.containers.some((c) => !iso6346Valid(c))
      ? "needs_review"
      : "extracted") as "extracted" | "needs_review",
    sourcePage: null,
  });

  const lineItems = out.line_items.map((li) => {
    const modelConf = li.confidence ?? 0.5;
    const present = Boolean(li.description);
    const confidence = recomputeFieldConfidence({
      modelConfidence: modelConf,
      key: "line_total",
      value: li.line_total,
      presentInText: present,
    });
    return {
      description: li.description,
      hsn: li.hsn,
      qty: li.qty,
      unitPrice: li.unit_price,
      lineTotal: li.line_total,
      confidence,
      sourcePage: li.source_page ?? null,
    };
  });

  return {
    documentType,
    status: "extracted",
    rawJson: out,
    model,
    fields,
    lineItems,
  };
}
