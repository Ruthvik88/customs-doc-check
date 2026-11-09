"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/supabase/authorization";
import { runAllCrossChecks } from "@/lib/crosschecks";
import { crossCheckInput } from "@/lib/crosscheck-source";

const BUCKET = "documents";

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

  const input = crossCheckInput(fields, lineItems, documents);

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
