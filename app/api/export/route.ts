"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient } from "@/lib/supabase/server";
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
  const row = buildExportRow(shipment, fieldByKey);
  const csv = buildCsv(EXPORT_COLUMNS, [row]);
  const fileName = `export_${shipment.shipment_number}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
