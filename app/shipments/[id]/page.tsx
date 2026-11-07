"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";

type DocType = "invoice" | "packing_list" | "bill_of_lading";
const DOC_LABELS: Record<DocType, string> = {
  invoice: "Commercial invoice",
  packing_list: "Packing list",
  bill_of_lading: "Bill of lading",
};
const DOC_STATUS_COLOR: Record<string, string> = {
  pending: "badge-outline",
  extracting: "badge-primary",
  extracted: "badge-success",
  needs_manual: "badge-warning",
  failed: "badge-destructive",
  manual: "badge-warning",
};

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const shipmentId = params.id;
  const supabase = useSupabaseClient();
  const db = supabase;

  const [shipment, setShipment] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [edits, setEdits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    load();
  }, [shipmentId, db]);

  if (!supabase) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Configuration error</h2>
        <p className="text-[var(--muted-foreground)] mt-2">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the dev server.
        </p>
      </div>
    );
  }

  async function load() {
    try {
      const [s, d, f, e] = await Promise.all([
        db.from("shipments").select("*, suppliers(name)").eq("id", shipmentId).single(),
        db.from("documents").select("*").eq("shipment_id", shipmentId).order("type"),
        db.from("fields").select("*").eq("shipment_id", shipmentId).order("key"),
        db.from("field_edits").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(50),
      ]);
      if (s.error) throw s.error;
      setShipment(s.data);
      setDocuments(d.data ?? []);
      setFields(f.data ?? []);
      setEdits(e.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipment");
    } finally {
      setLoading(false);
    }
  }

  const docTypes: DocType[] = ["invoice", "packing_list", "bill_of_lading"];

  async function uploadFile(type: DocType, file: File) {
    const formData = new FormData();
    formData.append("shipmentId", shipmentId);
    formData.append("type", type);
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Upload failed");
      return;
    }
    setError("");
    load();
  }

  async function handleExtract() {
    setExtracting(true);
    setError("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Extraction failed");
        return;
      }
      const j = await res.json();
      setError("");
      // Poll until documents reach a terminal state.
      await pollUntilTerminal(j.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function pollUntilTerminal(results: any[]) {
    const docIds = results.map((r) => r.documentId).filter(Boolean);
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const { data } = await db.from("documents").select("id,status").in("id", docIds);
      const statuses = new Set((data ?? []).map((d: any) => d.status));
      if (!["pending", "extracting"].some((s) => statuses.has(s))) {
        load();
        return;
      }
    }
    load();
  }

  if (loading) return <Skeleton height={200} width="100%" />;
  if (!shipment) return <div className="text-[var(--muted-foreground)]">{error || "Shipment not found"}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Shipment {shipment.shipment_number}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {shipment.suppliers?.name || "Unknown supplier"} &nbsp;•&nbsp;
            {shipment.currency || ""} {shipment.incoterm || ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(shipment.status)} className="text-[var(--foreground)]">
            {shipment.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push(`/shipments/${shipmentId}/review`)}>
            Review
          </Button>
        </div>
      </div>

      {error && <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="card">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Documents</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {docTypes.map((type) => {
            const doc = documents.find((d) => d.type === type);
            return (
              <DocumentSlot
                key={type}
                type={type}
                label={DOC_LABELS[type]}
                doc={doc ?? null}
                onUpload={(file) => uploadFile(type, file)}
              />
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Extraction</h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            Run Gemini extraction on all uploaded documents. Results are reviewed on the next screen.
          </p>
          <Button
            variant="primary"
            disabled={extracting || documents.length === 0}
            onClick={handleExtract}
            className="ml-auto"
          >
            {extracting ? "Extracting…" : "Extract all documents"}
          </Button>
        </div>
      </section>

      {documents.length > 0 && (
        <section className="card">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Extracted fields</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <th className="pb-3 font-semibold">Field</th>
                  <th className="pb-3 font-semibold">Value</th>
                  <th className="pb-3 font-semibold text-right">Confidence</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.id} className="border-b border-[var(--border)]">
                    <td className="pb-3 text-[var(--foreground)] font-medium">{f.key}</td>
                    <td className="pb-3 text-[var(--foreground)]">{f.value ?? "—"}</td>
                    <td className="pb-3 text-right text-[var(--muted-foreground)]">
                      {f.confidence != null ? (Math.round(f.confidence * 100)) + "%" : "—"}
                    </td>
                    <td className="pb-3">
                      <Badge variant={fieldStatusVariant(f.status)} className="text-[var(--foreground)]">
                        {f.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {edits.length > 0 && (
        <section className="card mt-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">Edit history</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">Field</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Old → New</th>
                </tr>
              </thead>
              <tbody>
                {edits.map((ed) => (
                  <tr key={ed.id} className="border-b border-[var(--border)]">
                    <td className="pb-3 text-[var(--muted-foreground)] text-sm">{new Date(ed.created_at).toLocaleString()}</td>
                    <td className="pb-3 text-[var(--foreground)] text-sm">{ed.field_key}</td>
                    <td className="pb-3 text-[var(--muted-foreground)] text-xs">{ed.action}</td>
                    <td className="pb-3 text-[var(--muted-foreground)] text-sm">{ed.profiles?.full_name ?? "—"}</td>
                    <td className="pb-3 text-sm">{ed.old_value ?? "—"} → {ed.new_value ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function statusVariant(status: string) {
  switch (status) {
    case "Approved": return "success";
    case "Needs review": return "warning";
    case "Extracting": return "primary";
    case "Ready for approval": return "primary";
    default: return "outline";
  }
}

function fieldStatusVariant(status: string) {
  switch (status) {
    case "confirmed": return "success";
    case "edited": return "primary";
    case "needs_review": return "warning";
    case "manual": return "warning";
    default: return "outline";
  }
}

function DocumentSlot({
  type,
  label,
  doc,
  onUpload,
}: {
  type: DocType;
  label: string;
  doc: any;
  onUpload: (file: File) => void;
}) {
  const [picked, setPicked] = useState<File | null>(null);

  return (
    <div className="border border-[var(--border)] rounded-sm p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{type}</span>
        <span className="ml-auto text-xs font-medium text-[var(--foreground)]">{label}</span>
      </div>

      {doc ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">{doc.file_name}</span>
          <Badge variant={(DOC_STATUS_COLOR[doc.status] ?? "outline") as "outline" | "primary" | "success" | "warning" | "destructive"} className="text-[var(--foreground)] text-xs">
            {doc.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => (document.getElementById(`file-${type}-replace`) as HTMLInputElement).click()}>
            Replace
          </Button>
          <input id={`file-${type}-replace`} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }} />
        </div>
      ) : (
        <div className="flex items-center gap-3 pt-2">
          <label
            htmlFor={`file-${type}-main`}
            className="flex items-center gap-2 cursor-pointer rounded-sm border border-dashed border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            Upload
            <input id={`file-${type}-main`} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }} />
          </label>
          <span className="ml-auto text-xs text-[var(--muted-foreground)]">PDF / JPG / PNG · ≤10 MB</span>
        </div>
      )}
    </div>
  );
}
