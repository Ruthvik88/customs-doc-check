"use strict";

import { NextResponse } from "next/server";
import { requireSupabaseClient, requireServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "documents";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await requireSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("*, shipments(created_by)")
    .eq("id", params.id)
    .single();
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Any authenticated user can view documents (RLS allows select for all).
  const service = requireServiceRoleClient();
  const { data: signed, error } = await service.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60 * 5); // 5 minutes
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: signed.signedUrl, fileName: doc.file_name, type: doc.type, mimeType: doc.mime_type });
}
