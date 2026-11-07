"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\r\n]/.test(s) || /^\s|\s$/.test(s)) {
    return `"${String(s).replace(/"/g, '""')}"`;
  }
  return s;
}

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

  const containers = Array.isArray(shipment.containers) ? shipment.containers.join(", ") : "";

  const columns = [
    "shipment_number", "supplier", "consignee", "invoice_number", "invoice_date",
    "currency", "incoterm", "invoice_total", "packages", "gross_weight_kg",
    "net_weight_kg", "containers", "bl_number", "vessel",
    "port_of_loading", "port_of_discharge",
  ];
  const row = [
    shipment.shipment_number,
    shipment.suppliers?.name ?? "",
    fieldByKey["consignee"] ?? "",
    shipment.invoice_number ?? "",
    shipment.invoice_date ?? "",
    shipment.currency ?? "",
    shipment.incoterm ?? "",
    fieldByKey["invoice_total"] ?? "",
    shipment.total_packages ?? "",
    shipment.gross_weight_kg ?? "",
    shipment.net_weight_kg ?? "",
    containers,
    shipment.bl_number ?? "",
    shipment.vessel ?? "",
    shipment.port_of_loading ?? "",
    shipment.port_of_discharge ?? "",
  ];

  const csv = [columns.join(","), row.map(csvEscape).join(",")].join("\r\n") + "\r\n";
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
