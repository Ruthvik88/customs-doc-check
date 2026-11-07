"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
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
  req: Request,
  { params }: { params: { shipmentId: string } },
) {
  const supabase = await requireSupabaseClient();
  const service = requireServiceRoleClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: shipment } = await supabase
    .from("shipments")
    .select("id")
    .eq("id", params.shipmentId)
    .single();
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, type")
    .eq("shipment_id", params.shipmentId);
  const docMap: Record<string, any> = {};
  for (const d of documents ?? []) docMap[d.type] = d;

  const { data: fields } = await supabase
    .from("fields")
    .select("*")
    .eq("shipment_id", params.shipmentId);
  const { data: lineItems } = await supabase
    .from("line_items")
    .select("*")
    .eq("shipment_id", params.shipmentId);

  const byDoc = (docId: string | null) =>
    (fields ?? []).filter((f) => f.document_id === docId);
  const linesByDoc = (docId: string | null) =>
    (lineItems ?? []).filter((l) => l.document_id === docId);

  const input: any = {
    invoice: docViewFrom(byDoc(docMap.invoice?.id ?? null), linesByDoc(docMap.invoice?.id ?? null)),
    packingList: docViewFrom(byDoc(docMap.packing_list?.id ?? null), linesByDoc(docMap.packing_list?.id ?? null)),
    billOfLading: docViewFrom(byDoc(docMap.bill_of_lading?.id ?? null), linesByDoc(docMap.bill_of_lading?.id ?? null)),
  };

  const results = runAllCrossChecks(input);

  // Upsert results (delete + insert for simplicity).
  await service.from("crosscheck_results").delete().eq("shipment_id", params.shipmentId);
  const rows = results.map((r) => ({
    shipment_id: params.shipmentId,
    check_type: r.check_type,
    status: r.status,
    value_a: r.value_a,
    value_b: r.value_b,
    delta: r.delta,
    fields_involved: r.fields_involved,
    details: r.details,
  }));
  if (rows.length) await service.from("crosscheck_results").insert(rows);

  return NextResponse.json({ results });
}
