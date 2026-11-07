import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractDocument, recomputeFieldConfidence } from "@/lib/extraction";

// ---------------------------------------------------------------------------
// Mock @google/genai so extraction tests never call the live API.
// ---------------------------------------------------------------------------
const generateContentMock = vi.fn();
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: generateContentMock,
    },
  })),
}));

function mockGeminiResponse(text: string, status?: number) {
  const err = status ? Object.assign(new Error("Gemini error"), { status }) : null;
  if (err) {
    generateContentMock.mockRejectedValue(err);
  } else {
    generateContentMock.mockResolvedValue({ text });
  }
}

const baseCached = {
  document_type: "invoice",
  supplier: { value: "Company B", confidence: 0.94, source_page: 1 },
  consignee: { value: "Nhava Sheva Imports Pvt. Ltd.", confidence: 0.94, source_page: 1 },
  invoice_number: { value: "INV-2025-1142", confidence: 0.94, source_page: 1 },
  invoice_date: { value: "2025-10-20", confidence: 0.94, source_page: 1 },
  currency: { value: "USD", confidence: 0.94, source_page: 1 },
  incoterm: { value: "FOB", confidence: 0.94, source_page: 1 },
  invoice_total: { value: "USD 19200.00", confidence: 0.92, source_page: 1 },
  packages: { value: "40", confidence: 0.94, source_page: 1 },
  gross_weight_kg: { value: "3120", confidence: 0.94, source_page: 1 },
  net_weight_kg: { value: "3000", confidence: 0.94, source_page: 1 },
  containers: ["MSKU1234565"],
  bl_number: { value: "BL-2025-0981", confidence: 0.94, source_page: 1 },
  vessel: { value: "MV Ocean Star", confidence: 0.94, source_page: 1 },
  port_of_loading: { value: "Shanghai, China", confidence: 0.94, source_page: 1 },
  port_of_discharge: { value: "Nhava Sheva, India", confidence: 0.94, source_page: 1 },
  line_items: [
    { description: "LED panel light 40W", hsn: "940540", qty: "2400", unit_price: "6.80", line_total: "16320.00", confidence: 0.96, source_page: 1 },
  ],
};

describe("extractDocument - live mode with mocked Gemini", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.EXTRACTION_MODE = "live";
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "gemini-1.5-flash";
    process.env.CONFIDENCE_THRESHOLD = "0.8";
    generateContentMock.mockReset();
  });

  afterEach(() => {
    delete process.env.EXTRACTION_MODE;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.CONFIDENCE_THRESHOLD;
  });

  it("returns needs_manual when Gemini returns invalid JSON (after retry)", async () => {
    const mod = await import("@/lib/extraction");
    mockGeminiResponse("{ not valid json");
    const res = await mod.extractDocument({
      documentType: "invoice",
      fileBuffer: Buffer.from("fake-pdf"),
      mimeType: "application/pdf",
    });
    expect(res.status).toBe("needs_manual");
    expect(res.error).toContain("invalid JSON");
  });

  it("returns failed when Gemini returns empty response (non-retryable)", async () => {
    const mod = await import("@/lib/extraction");
    generateContentMock.mockResolvedValue({ text: "" });
    const res = await mod.extractDocument({
      documentType: "invoice",
      fileBuffer: Buffer.from("fake-pdf"),
      mimeType: "application/pdf",
    });
    expect(res.status).toBe("failed");
    expect(res.error).toContain("Empty response");
  });

  it("returns needs_manual on 429 rate limit after retries", async () => {
    const mod = await import("@/lib/extraction");
    const rateErr = Object.assign(new Error("rate limited"), { status: 429 });
    generateContentMock.mockRejectedValue(rateErr);
    const res = await mod.extractDocument({
      documentType: "invoice",
      fileBuffer: Buffer.from("fake-pdf"),
      mimeType: "application/pdf",
    });
    expect(res.status).toBe("failed");
    expect(res.error).toContain("rate limited");
  });

  it("returns needs_manual when output fails schema validation", async () => {
    const mod = await import("@/lib/extraction");
    mockGeminiResponse(JSON.stringify({ document_type: "invoice" })); // missing required fields
    const res = await mod.extractDocument({
      documentType: "invoice",
      fileBuffer: Buffer.from("fake-pdf"),
      mimeType: "application/pdf",
    });
    expect(res.status).toBe("needs_manual");
    expect(res.error).toContain("schema validation");
  });

  it("marks low-confidence fields as needs_review", async () => {
    const mod = await import("@/lib/extraction");
    const lowConf = { ...baseCached, invoice_total: { value: "USD 999999.00", confidence: 0.3, source_page: 1 } };
    mockGeminiResponse(JSON.stringify(lowConf));
    const res = await mod.extractDocument({
      documentType: "invoice",
      fileBuffer: Buffer.from("fake-pdf"),
      mimeType: "application/pdf",
    });
    expect(res.status).toBe("extracted");
    const totalField = res.fields.find((f) => f.key === "invoice_total");
    expect(totalField.status).toBe("needs_review");
    expect(totalField.confidence).toBeLessThan(0.8);
  });

  it("returns extracted when output is valid and high confidence", async () => {
    const mod = await import("@/lib/extraction");
    mockGeminiResponse(JSON.stringify(baseCached));
    const res = await mod.extractDocument({
      documentType: "invoice",
      fileBuffer: Buffer.from("fake-pdf"),
      mimeType: "application/pdf",
    });
    expect(res.status).toBe("extracted");
    expect(res.rawJson).toEqual(baseCached);
    expect(res.fields.length).toBeGreaterThan(0);
  });
});

describe("recomputeFieldConfidence", () => {
  it("clamps to [0,1]", () => {
    expect(recomputeFieldConfidence({ modelConfidence: 2, key: "currency", value: "USD", presentInText: true })).toBe(1);
    expect(recomputeFieldConfidence({ modelConfidence: -1, key: "currency", value: "USD", presentInText: false })).toBeGreaterThanOrEqual(0);
  });

  it("flags low confidence when model is unsure", () => {
    const c = recomputeFieldConfidence({ modelConfidence: 0.3, key: "currency", value: "USD", presentInText: true });
    expect(c).toBeLessThan(0.8);
  });
});
