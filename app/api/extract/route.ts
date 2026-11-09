export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/supabase/authorization";
import { extractDocument } from "@/lib/extraction";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Rate limiter (in-memory, per user). Production should use Redis/Upstash.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateHits = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateHits.get(key);
  if (!entry || now > entry.reset) {
    rateHits.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

const BodySchema = z.object({
  shipmentId: z.string().uuid(),
});

export async function POST(req: Request) {
  const supabase = await requireSupabaseClient();

  // Authenticate + role check (executive only).
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const rate = rateLimit(user.id);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const role = await getProfileRole(supabase, user.id);
  if (role !== "documentation_executive") {
    return NextResponse.json({ error: "Forbidden: executive only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { shipmentId } = parsed.data;

  // Executives may process only shipments they created, as in the upload flow.
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, created_by, shipment_number, status")
    .eq("id", shipmentId)
    .single();
  if (shipmentError || !shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (shipment.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden: not your shipment" }, { status: 403 });
  }
  if (shipment.status === "Exported") {
    return NextResponse.json({ error: "Exported shipments cannot be changed" }, { status: 409 });
  }

  const service = requireServiceRoleClient();

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("type");
  if (documentsError) {
    return NextResponse.json({ error: documentsError.message }, { status: 500 });
  }

  // Mark shipment as extracting.
  await supabase.from("shipments").update({ status: "Extracting" }).eq("id", shipmentId);

  // Extract each document in parallel.
  const results = await Promise.allSettled(
    documents.map((doc) => extractOne(service, shipment, doc))
  );

  // Determine aggregate status.
  const failed = results.filter(
    (r) => r.status === "rejected" || (r.status === "fulfilled" && r.value.status === "failed")
  );
  const needsManual = results.filter(
    (r) => r.status === "fulfilled" && r.value.status === "needs_manual"
  );

  let shipmentStatus = "Needs review";
  if (failed.length > 0) shipmentStatus = "Needs review";
  else if (needsManual.length > 0) shipmentStatus = "Needs review";
  else shipmentStatus = "Needs review";

  await supabase.from("shipments").update({ status: shipmentStatus }).eq("id", shipmentId);

  return NextResponse.json({
    shipmentId,
    status: shipmentStatus,
    results: results.map((r, i) => ({
      documentId: documents[i]?.id,
      documentType: documents[i]?.type,
      status: r.status === "fulfilled" ? r.value.status : "failed",
      error:
        r.status === "rejected"
          ? (r.reason instanceof Error ? r.reason.message : String(r.reason))
          : r.value.error,
    })),
  });
}

async function extractOne(service: any, shipment: any, doc: any) {
  // Update document status to extracting.
  await service
    .from("documents")
    .update({ status: "extracting", extraction_attempts: doc.extraction_attempts + 1 })
    .eq("id", doc.id);

  try {
    let fileBuffer: Buffer;
    let mimeType: string;
    const mode = process.env.EXTRACTION_MODE || "cached";

    if (mode === "cached") {
      // Read pre-saved extraction JSON from data/seeds/cache/<shipment_number>/<type>.json
      const fs = await import("fs");
      const path = await import("path");
      const cacheFile = path.join(
        process.cwd(),
        "data",
        "seeds",
        "cache",
        shipment.shipment_number,
        `${doc.type}.json`
      );
      if (!fs.existsSync(cacheFile)) {
        throw new Error(`No cached extraction for ${doc.type}`);
      }
      const cachedJson = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      const result = await extractDocument({
        documentType: doc.type as any,
        fileBuffer: Buffer.alloc(0),
        mimeType: "application/json",
        cachedJson,
      });
      await writeExtraction(service, doc, shipment, result);
      return result;
    }

    // Live mode: download file from private Storage.
    const { data: fileData, error: downloadError } = await service.storage
      .from("documents")
      .download(doc.storage_path);
    if (downloadError || !fileData) {
      throw new Error(downloadError?.message || "Failed to download document");
    }
    const ab = await fileData.arrayBuffer();
    fileBuffer = Buffer.from(ab);
    mimeType = doc.mime_type || "application/pdf";

    const result = await extractDocument({
      documentType: doc.type as any,
      fileBuffer,
      mimeType,
    });
    await writeExtraction(service, doc, shipment, result);
    return result;
  } catch (err) {
    await service
      .from("documents")
      .update({ status: "failed" })
      .eq("id", doc.id);
    return {
      documentType: doc.type,
      status: "failed",
      error: err instanceof Error ? err.message : "Extraction failed",
    };
  }
}

async function writeExtraction(service: any, doc: any, shipment: any, result: any) {
  // Store raw extraction JSON.
  const { data: extraction } = await service
    .from("extractions")
    .insert({ document_id: doc.id, raw_json: result.rawJson, model: result.model })
    .select()
    .single();

  // Upsert fields (delete existing first on re-extraction).
  await service.from("fields").delete().eq("document_id", doc.id);

  const fieldRows = result.fields.map((f: any) => ({
    shipment_id: shipment.id,
    document_id: doc.id,
    key: f.key,
    value: f.value,
    ai_value: f.aiValue,
    confidence: f.confidence,
    status: f.status,
    source_page: f.sourcePage,
  }));
  if (fieldRows.length) {
    await service.from("fields").insert(fieldRows);
  }

  // Line items.
  await service.from("line_items").delete().eq("document_id", doc.id);
  const itemRows = result.lineItems.map((li: any) => ({
    shipment_id: shipment.id,
    document_id: doc.id,
    description: li.description,
    hsn: li.hsn,
    qty: li.qty ? Number(li.qty) : null,
    unit_price: li.unitPrice ? Number(li.unitPrice) : null,
    line_total: li.lineTotal ? Number(li.lineTotal) : null,
    confidence: li.confidence,
    status: li.confidence != null && li.confidence < Number(process.env.CONFIDENCE_THRESHOLD ?? 0.8) ? "needs_review" : "extracted",
    source_page: li.sourcePage,
  }));
  if (itemRows.length) {
    await service.from("line_items").insert(itemRows);
  }

  // Update document status.
  await service.from("documents").update({ status: result.status }).eq("id", doc.id);
}
