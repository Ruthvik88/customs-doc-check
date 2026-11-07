"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { buildExportRow, buildCsv, EXPORT_COLUMNS } from "@/lib/export";

export async function POST(req: Request) {
  const supabase = await requireSupabaseClient();
  const service = requireServiceRoleClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "documentation_manager") {
    return NextResponse.json({ error: "Forbidden: manager only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { shipmentId } = (body as { shipmentId?: string }) ?? {};
  if (!shipmentId) {
    return NextResponse.json({ error: "shipmentId required" }, { status: 400 });
  }

  // Load shipment + supplier + reconciled fields.
  const { data: shipment } = await service
    .from("shipments")
    .select("*, suppliers(name)")
    .eq("id", shipmentId)
    .single();
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  // Server-side export gating: approved, zero needs_review fields,
  // zero unresolved failed cross-checks.
  if (shipment.status !== "Approved") {
    return NextResponse.json({ error: "Shipment must be Approved before export" }, { status: 409 });
  }

  const { count: needsReview } = await service
    .from("fields")
    .select("*", { count: "exact", head: true })
    .eq("shipment_id", shipmentId)
    .eq("status", "needs_review");
  if ((needsReview ?? 0) > 0) {
    return NextResponse.json({ error: "Shipment has field(s) still needing review" }, { status: 409 });
  }

  const { count: failedUnresolved } = await service
    .from("crosscheck_results")
    .select("*", { count: "exact", head: true })
    .eq("shipment_id", shipmentId)
    .eq("status", "fail")
    .is("resolved_by", null);
  if ((failedUnresolved ?? 0) > 0) {
    return NextResponse.json({ error: "Shipment has unresolved failed cross-check(s)" }, { status: 409 });
  }

  // Reconciled field values (consignee + invoice_total from fields table).
  const { data: fields } = await service
    .from("fields")
    .select("key, value")
    .eq("shipment_id", shipmentId)
    .in("key", ["consignee", "invoice_total"]);
  const fieldByKey: Record<string, string> = {};
  for (const f of fields ?? []) {
    if (f.value) fieldByKey[f.key] = f.value;
  }

  const row = buildExportRow(shipment, fieldByKey);
  const csv = buildCsv(EXPORT_COLUMNS, [row]);
  const fileName = `export_${shipment.shipment_number}.csv`;

  // Record the export.
  await service.from("exports").insert({
    shipment_id: shipmentId,
    exported_by: user.id,
    file_path: fileName,
  });
  await service
    .from("shipments")
    .update({ status: "Exported", exported_at: new Date().toISOString() })
    .eq("id", shipmentId);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
