"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/supabase/authorization";
import { buildExportRow, buildCsv, EXPORT_COLUMNS } from "@/lib/export";

export async function POST(req: Request) {
  const supabase = await requireSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const role = await getProfileRole(supabase, user.id);
  if (role !== "documentation_manager") {
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

  const { data: snapshot, error: exportError } = await supabase.rpc("shipment_export_snapshot", {
    p_shipment_id: shipmentId,
  });
  if (exportError || !snapshot) {
    return NextResponse.json({ error: exportError?.message ?? "Shipment cannot be exported" }, { status: 409 });
  }

  const { shipment, fields: fieldByKey } = snapshot as {
    shipment: Parameters<typeof buildExportRow>[0];
    fields: Record<string, string>;
  };
  const service = requireServiceRoleClient();
  const [fieldsResult, linesResult] = await Promise.all([
    service.from("fields").select("key,value").eq("shipment_id", shipmentId).in("status", ["confirmed", "edited"]),
    service.from("line_items").select("description,hsn,qty,unit_price,line_total").eq("shipment_id", shipmentId).order("id", { ascending: true }),
  ]);
  if (fieldsResult.error || linesResult.error) {
    return NextResponse.json({ error: "Failed to load confirmed export data" }, { status: 500 });
  }
  const confirmedFields = Object.fromEntries((fieldsResult.data ?? []).map((field) => [field.key, field.value ?? ""]));
  const allFields = { ...fieldByKey, ...confirmedFields };
  const lineItems = linesResult.data ?? [];
  const rows = lineItems.map((lineItem) => buildExportRow(shipment, allFields, lineItem));
  const csv = buildCsv(EXPORT_COLUMNS, rows);
  const fileName = `export_${shipment.shipment_number}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
