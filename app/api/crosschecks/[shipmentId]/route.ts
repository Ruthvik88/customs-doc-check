"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/supabase/authorization";
import { runAllCrossChecks } from "@/lib/crosschecks";

const BUCKET = "documents";

function toNum(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const s = typeof v === "number" ? String(v) : String(v);
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function docViewFrom(docFields: any[], docLines: any[]) {
  const get = (key: string) => {
    const f = docFields.find((x) => x.key === key);
    return f ? f.value : null;
  };
  const containersRaw = get("containers");
  const containers = containersRaw
    ? String(containersRaw).split(",").map((c) => c.trim()).filter(Boolean)
    : [];
  return {
    total: toNum(get("invoice_total")),
    currency: get("currency") ?? undefined,
    incoterm: get("incoterm") ?? undefined,
    supplier: get("supplier") ?? undefined,
    packages: toNum(get("packages")),
    grossWeight: toNum(get("gross_weight_kg")),
    containers,
    lines: (docLines ?? []).map((l) => ({
      description: l.description ?? null,
      hsn: l.hsn ?? undefined,
      qty: l.qty ?? undefined,
      unitPrice: l.unit_price ?? undefined,
      lineTotal: l.line_total ?? undefined,
    })),
  };
}

export async function POST(
  _req: Request,
  { params }: { params: { shipmentId: string } },
) {
  const supabase = await requireSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const role = await getProfileRole(supabase, user.id);
  if (role !== "documentation_executive") {
    return NextResponse.json({ error: "Forbidden: executive only" }, { status: 403 });
  }

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, created_by")
    .eq("id", params.shipmentId)
    .single();
  if (shipmentError || !shipment) {
    if (shipmentError && shipmentError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to authorize shipment" }, { status: 500 });
    }
  }
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  if (shipment.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden: not your shipment" }, { status: 403 });
  }

  const service = requireServiceRoleClient();

  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("*")
    .eq("shipment_id", params.shipmentId)
    .order("id", { ascending: true });
  if (documentsError || !documents) {
    return NextResponse.json({ error: "Failed to load shipment documents" }, { status: 500 });
  }
  const docMap: Record<string, any> = {};
  for (const d of documents ?? []) docMap[d.type] = d;

  const { data: fields, error: fieldsError } = await supabase
    .from("fields")
    .select("*")
    .eq("shipment_id", params.shipmentId)
    .order("id", { ascending: true });
  if (fieldsError || !fields) {
    return NextResponse.json({ error: "Failed to load extracted fields" }, { status: 500 });
  }
  const { data: lineItems, error: lineItemsError } = await supabase
    .from("line_items")
    .select("*")
    .eq("shipment_id", params.shipmentId)
    .order("id", { ascending: true });
  if (lineItemsError || !lineItems) {
    return NextResponse.json({ error: "Failed to load shipment line items" }, { status: 500 });
  }

  const byDoc = (docId: string | null) =>
    fields.filter((f) => f.document_id === docId);
  const linesByDoc = (docId: string | null) =>
    lineItems.filter((l) => l.document_id === docId);

  const input: any = {
    invoice: docViewFrom(byDoc(docMap.invoice?.id ?? null), linesByDoc(docMap.invoice?.id ?? null)),
    packingList: docViewFrom(byDoc(docMap.packing_list?.id ?? null), linesByDoc(docMap.packing_list?.id ?? null)),
    billOfLading: docViewFrom(byDoc(docMap.bill_of_lading?.id ?? null), linesByDoc(docMap.bill_of_lading?.id ?? null)),
  };

  const results = runAllCrossChecks(input);

  const { error: persistError } = await service.rpc("persist_crosscheck_results", {
    p_shipment_id: params.shipmentId,
    p_actor_id: user.id,
    p_source_snapshot: { documents, fields, line_items: lineItems },
    p_results: results,
  });
  if (persistError) {
    const stale = persistError.message?.includes("source data changed");
    return NextResponse.json(
      { error: stale ? "Shipment data changed during recomputation; please retry" : "Failed to save cross-check results" },
      { status: stale ? 409 : 500 },
    );
  }

  return NextResponse.json({ results });
}
