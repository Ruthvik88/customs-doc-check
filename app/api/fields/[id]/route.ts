"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/supabase/authorization";
import { z } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
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

  const body = await req.json();
  const parsed = z
    .object({
      value: z.string().optional(),
      status: z.enum(["extracted", "needs_review", "confirmed", "edited", "manual"]).optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
    .safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Verify field exists and user can edit it (executive on their shipment).
  const { data: field } = await supabase
    .from("fields")
    .select("*, shipments(created_by, supplier_id, status)")
    .eq("id", params.id)
    .single();
  if (!field) {
    return NextResponse.json({ error: "Field not found" }, { status: 404 });
  }
  if (field.shipments.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (field.shipments.status === "Exported") {
    return NextResponse.json({ error: "Exported shipments cannot be changed" }, { status: 409 });
  }

  const service = requireServiceRoleClient();

  const updates: Record<string, any> = {};
  if (parsed.data.value !== undefined) updates.value = parsed.data.value;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.confidence !== undefined) updates.confidence = parsed.data.confidence;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error: updError } = await service
    .from("fields")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();
  if (updError) {
    return NextResponse.json({ error: updError.message }, { status: 500 });
  }

  // Audit log (insert-only).
  if (parsed.data.value !== undefined || parsed.data.status !== undefined) {
    await service.from("field_edits").insert({
      shipment_id: field.shipment_id,
      field_key: field.key,
      document_id: field.document_id,
      old_value: field.value,
      new_value: parsed.data.value ?? field.value,
      action: parsed.data.status === "manual" ? "manual_entry" : "edit",
      user_id: user.id,
      supplier_id: field.shipments.supplier_id,
    });
  }

  return NextResponse.json({ field: updated });
}
