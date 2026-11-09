"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";
import { getProfileRole } from "@/lib/supabase/authorization";
import { z } from "zod";

const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE ?? 10 * 1024 * 1024); // 10 MB
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const BUCKET = "documents";

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .slice(0, 120);
}

export async function POST(req: Request) {
  const supabase = await requireSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const role = await getProfileRole(supabase, user.id);
  if (role !== "documentation_executive") {
    return NextResponse.json({ error: "Forbidden: executive only" }, { status: 403 });
  }

  const formData = await req.formData();
  const shipmentId = formData.get("shipmentId") as string;
  const type = formData.get("type") as string;
  const file = formData.get("file") as File | null;

  if (!shipmentId || !type || !file) {
    return NextResponse.json({ error: "shipmentId, type, and file are required" }, { status: 400 });
  }
  if (!["invoice", "packing_list", "bill_of_lading"].includes(type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json({ error: "Only PDF, JPG, or PNG files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  // Verify shipment exists and belongs to this executive (created_by).
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, created_by, status")
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

  // Don't allow duplicate type; delete existing document of this type first (re-upload).
  const { data: existing } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("shipment_id", shipmentId)
    .eq("type", type);

  const fileBuffer = await file.arrayBuffer();
  const safeName = sanitizeFileName(file.name);
  const storagePath = `shipments/${shipmentId}/${type}/${Date.now()}_${safeName}`;

  // Remove existing file/row if re-uploading.
  if (existing?.length) {
    const { error: deleteError } = await service.from("documents").delete()
      .eq("shipment_id", shipmentId).eq("type", type);
    if (deleteError) {
      const status = deleteError.message?.includes("Source changes are not allowed after export") ? 409 : 500;
      return NextResponse.json({ error: deleteError.message }, { status });
    }
    for (const d of existing as any[]) {
      const { error: fieldError } = await service.from("fields").delete().eq("document_id", d.id);
      if (fieldError) return NextResponse.json({ error: fieldError.message }, { status: 500 });
      const { error: lineItemError } = await service.from("line_items").delete().eq("document_id", d.id);
      if (lineItemError) return NextResponse.json({ error: lineItemError.message }, { status: 500 });
      const { error: extractionError } = await service.from("extractions").delete().eq("document_id", d.id);
      if (extractionError) return NextResponse.json({ error: extractionError.message }, { status: 500 });
    }
    await service.storage.from(BUCKET).remove(existing.map((d) => d.storage_path));
  }

  const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, fileBuffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: true,
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: doc, error: docError } = await service
    .from("documents")
    .insert({
      shipment_id: shipmentId,
      type,
      storage_path: storagePath,
      file_name: safeName,
      file_size: file.size,
      mime_type: file.type,
      status: "pending",
      extraction_attempts: 0,
    })
    .select()
    .single();
  if (docError) {
    await service.storage.from(BUCKET).remove([storagePath]);
    const status = docError.message?.includes("Source changes are not allowed after export") ? 409 : 500;
    return NextResponse.json({ error: docError.message }, { status });
  }

  // Keep review state set by the source-change trigger after approved shipments are edited.
  await supabase.from("shipments").update({ status: "Draft" })
    .eq("id", shipmentId).neq("status", "Needs review");

  return NextResponse.json({ document: doc });
}
