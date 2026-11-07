"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type DocType = "invoice" | "packing_list" | "bill_of_lading";
const DOC_LABELS: Record<DocType, string> = {
  invoice: "Commercial invoice",
  packing_list: "Packing list",
  bill_of_lading: "Bill of lading",
};
const DOC_ORDER: DocType[] = ["invoice", "packing_list", "bill_of_lading"];

const SECTIONS: Record<string, { key: string; label: string }[]> = {
  Parties: [
    { key: "supplier", label: "Supplier / exporter" },
    { key: "consignee", label: "Importer / consignee" },
  ],
  Invoice: [
    { key: "invoice_number", label: "Invoice number" },
    { key: "invoice_date", label: "Invoice date" },
    { key: "currency", label: "Currency" },
    { key: "incoterm", label: "Incoterm" },
    { key: "invoice_total", label: "Invoice total" },
  ],
  "Weights & packages": [
    { key: "packages", label: "Total packages" },
    { key: "gross_weight_kg", label: "Gross weight (kg)" },
    { key: "net_weight_kg", label: "Net weight (kg)" },
  ],
  "Containers & BL": [
    { key: "containers", label: "Container numbers" },
    { key: "bl_number", label: "BL number" },
    { key: "vessel", label: "Vessel" },
    { key: "port_of_loading", label: "Port of loading" },
    { key: "port_of_discharge", label: "Port of discharge" },
  ],
};

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const shipmentId = params.id;
  const supabase = useSupabaseClient();

  if (!supabase) return <Skeleton height="600" width="100%" />;

  const [shipment, setShipment] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [crosschecks, setCrosschecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [activeDoc, setActiveDoc] = useState<DocType>("invoice");
  const [pageNo, setPageNo] = useState(1);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const needsReviewFields = fields.filter((f) => f.status === "needs_review" || f.status === "manual");

  useEffect(() => {
    load();
  }, [shipmentId]);

  async function load() {
    try {
      setLoading(true);
      const [s, d, f, l, c] = await Promise.all([
        supabase!.from("shipments").select("*, suppliers(name)").eq("id", shipmentId).single(),
        supabase!.from("documents").select("*").eq("shipment_id", shipmentId).order("type"),
        supabase!.from("fields").select("*").eq("shipment_id", shipmentId).order("key"),
        supabase!.from("line_items").select("*").eq("shipment_id", shipmentId),
        supabase!.from("crosscheck_results").select("*").eq("shipment_id", shipmentId),
      ]);
      if (s.error) throw s.error;
      setShipment(s.data);
      setDocuments(d.data ?? []);
      setFields(f.data ?? []);
      setLineItems(l.data ?? []);
      setCrosschecks(c.data ?? []);

      // Fetch signed URLs for viewer.
      const urls: Record<string, string> = {};
      for (const doc of d.data ?? []) {
        const { data } = await supabase!
          .from("documents")
          .select("id")
          .eq("id", doc.id)
          .single();
        // signed URL fetched via API route
        const res = await fetch(`/api/documents/${doc.id}/signed-url`);
        if (res.ok) {
          const j = await res.json();
          urls[doc.type] = j.signedUrl;
        }
      }
      setSignedUrls(urls);

      // If no documents yet, go to detail.
      if ((d.data ?? []).length === 0) {
        router.push(`/shipments/${shipmentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review");
    } finally {
      setLoading(false);
    }
  }

  const focusedField = needsReviewFields[focusedIndex];

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault();
          if (focusedField) confirmField(focusedField.id, focusedField.value ?? "");
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, needsReviewFields.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      }
      if ((e.key === "c" || e.key === "C") && focusedField) {
        e.preventDefault();
        confirmField(focusedField.id, focusedField.value ?? "");
      }
      if (e.key === "1") setActiveDoc("invoice");
      if (e.key === "2") setActiveDoc("packing_list");
      if (e.key === "3") setActiveDoc("bill_of_lading");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [needsReviewFields, focusedField]);

  async function confirmField(fieldId: string, value: string) {
    if (saving.has(fieldId)) return;
    setSaving((prev) => new Set([...prev, fieldId]));
    try {
      const res = await fetch(`/api/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, status: "confirmed" }),
      });
      if (!res.ok) throw new Error("Confirm failed");
      await recomputeCrosschecks();
      setFields((fs) => fs.map((f) => (f.id === fieldId ? { ...f, value, status: "confirmed" } : f)));
      setFocusedIndex((i) => Math.min(i, needsReviewFields.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setSaving((prev) => {
        const n = new Set(prev);
        n.delete(fieldId);
        return n;
      });
    }
  }

  async function editField(fieldId: string, value: string) {
    setSaving((prev) => new Set([...prev, fieldId]));
    try {
      const res = await fetch(`/api/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, status: "edited" }),
      });
      if (!res.ok) throw new Error("Edit failed");
      await recomputeCrosschecks();
      setFields((fs) => fs.map((f) => (f.id === fieldId ? { ...f, value, status: "edited" } : f)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed");
    } finally {
      setSaving((prev) => {
        const n = new Set(prev);
        n.delete(fieldId);
        return n;
      });
    }
  }

  async function recomputeCrosschecks() {
    const res = await fetch(`/api/crosschecks/${shipmentId}`, { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      setCrosschecks(j.results ?? []);
    }
    load();
  }

  const failedChecks = crosschecks.filter((c) => c.status === "fail");

  if (loading) return <Skeleton height={600} width="100%" />;
  if (!shipment) return <div className="text-[var(--muted-foreground)]">{error || "Shipment not found"}</div>;

  const activeDocObj = documents.find((d) => d.type === activeDoc);

  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      {/* Left: document viewer */}
      <div className="flex-1 min-w-0 border border-[var(--border)] rounded-sm bg-[var(--card)] p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Document</span>
          <div className="ml-auto flex gap-1">
            {DOC_ORDER.map((t) => {
              const d = documents.find((x) => x.type === t);
              if (!d) return null;
              const statusColor: Record<string, string> = {
                pending: "badge-outline", extracting: "badge-primary", extracted: "badge-success",
                needs_manual: "badge-warning", failed: "badge-destructive", manual: "badge-warning",
              };
              return (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  onClick={() => { setActiveDoc(t); setPageNo(1); }}
                  className={cnPill(activeDoc === t, statusColor[d.status ?? "pending"])}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1).replace("_", " ")}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 relative overflow-auto min-h-0">
          {activeDocObj ? (
            <DocumentViewer
              doc={activeDocObj}
              signedUrl={signedUrls[activeDocObj.id] || ""}
              pageNo={pageNo}
              onPageChange={setPageNo}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
              <p>No {DOC_LABELS[activeDoc]} uploaded.</p>
            </div>
          )}
        </div>
        {activeDocObj && (
          <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" size="sm" disabled={pageNo <= 1} onClick={() => setPageNo(pageNo - 1)}>Prev page</Button>
            <input
              type="number"
              value={pageNo}
              onChange={(e) => setPageNo(Math.max(1, parseInt(e.target.value) || 1))}
              className="input w-12 text-center"
            />
            <Button variant="outline" size="sm" onClick={() => setPageNo(pageNo + 1)}>Next page</Button>
            <span className="ml-auto text-xs text-[var(--muted-foreground)]">
              {activeDocObj.status}
            </span>
          </div>
        )}
      </div>

      {/* Right: fields + cross-checks */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold text-[var(--foreground)]">Review {shipment.shipment_number}</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Confirm or edit each flagged field. {needsReviewFields.length} field(s) need review.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={recomputeCrosschecks} disabled={saving.size > 0}>
              Re-run cross-checks
            </Button>
            <Button variant="primary" size="sm" disabled={needsReviewFields.length > 0 || saving.size > 0} onClick={() => router.push(`/shipments/${shipmentId}/approve`)}>
              Mark ready for approval
            </Button>
          </div>
        </div>

        {error && <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">{error}</div>}

        {/* Keyboard hint */}
        <div className="text-xs text-[var(--muted-foreground)] mb-4 bg-[var(--secondary)] rounded-sm p-3">
          <span className="font-semibold">Keyboard:</span> ↑/↓ next flagged field &nbsp;·&nbsp; Ctrl+Enter confirm &nbsp;·&nbsp; C confirm &nbsp;·&nbsp; 1/2/3 switch document
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto">
          {Object.entries(SECTIONS).map(([sectionName, keys]) => (
            <div key={sectionName} className="col-span-2 card">
              <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
                {sectionName}
              </h2>
              <div className="space-y-2">
                {keys.map(({ key, label }) => {
                  const field = fields.find((f) => f.key === key);
                  return field ? (
                    <FieldRow
                      key={key}
                      field={field}
                      label={label}
                      focused={focusedField?.id === field.id}
                      onConfirm={confirmField}
                      onEdit={editField}
                      saving={saving.has(field.id)}
                    />
                  ) : (
                    <EmptyFieldRow key={key} label={label} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Line items table */}
        {lineItems.length > 0 && (
          <div className="card mt-4">
            <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
              Line items
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <th className="pb-2 text-left">Description</th>
                  <th className="pb-2 text-left">HSN</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit price</th>
                  <th className="pb-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((li) => (
                  <tr key={li.id} className="border-b border-[var(--border)]">
                    <td className="pb-2 text-[var(--foreground)]">{li.description}</td>
                    <td className="pb-2 text-[var(--muted-foreground)]">{li.hsn || "—"}</td>
                    <td className="pb-2 text-right">{li.qty ?? "—"}</td>
                    <td className="pb-2 text-right">{li.unit_price ?? "—"}</td>
                    <td className="pb-2 text-right">{li.line_total ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cross-check panel */}
        <div className="card mt-4 flex-1 min-h-0 overflow-y-auto">
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2 flex items-center gap-2">
            Cross-checks
            <Badge variant={failedChecks.length > 0 ? "destructive" : "success"} className="text-[var(--foreground)] text-xs ml-auto">
              {failedChecks.length} failed
            </Badge>
          </h2>
          <div className="space-y-2 p-1">
            {crosschecks.map((c) => (
              <CrossCheckRow key={c.id} check={c} onJump={() => {}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function cnPill(active: boolean, statusClass: string) {
  const base = "rounded-sm px-2.5 py-1 text-xs border";
  if (active) return `${base} bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]`;
  return `${base} border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]`;
}

function FieldRow({
  field,
  label,
  focused,
  onConfirm,
  onEdit,
  saving,
}: {
  field: any;
  label: string;
  focused: boolean;
  onConfirm: (id: string, value: string) => void;
  onEdit: (id: string, value: string) => void;
  saving: boolean;
}) {
  const [editValue, setEditValue] = useState(field.value ?? "");
  const needsReview = field.status === "needs_review" || field.status === "manual";
  const lowConf = field.confidence != null && field.confidence < 0.8;

  return (
    <div
      className={`flex items-start gap-3 p-2 rounded-sm border transition-colors ${
        needsReview
          ? "border-[var(--warning)] bg-amber-50/40"
          : "border-transparent hover:bg-[var(--secondary)]"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--foreground)]">{label}</span>
          {lowConf && <Badge variant="warning" className="text-[var(--warning)] text-[10px] border-[var(--warning)]">Low confidence</Badge>}
          <Badge variant="outline" className="text-[var(--muted-foreground)] text-[10px]">
            {field.status}
          </Badge>
          <Badge variant="outline" className="text-[var(--muted-foreground)] text-[10px]">
            p{field.source_page ?? "—"}
          </Badge>
        </div>
        <div className="mt-1">
          {needsReview ? (
            <div className="flex gap-2">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="input w-48"
                autoFocus={focused}
              />
              <Button
                variant="primary"
                size="sm"
                disabled={saving}
                onClick={() => onConfirm(field.id, editValue)}
              >
                Confirm
              </Button>
              <Button variant="outline" size="sm" disabled={saving} onClick={() => onEdit(field.id, editValue)}>
                Edit
              </Button>
            </div>
          ) : (
            <span className="text-[var(--foreground)] font-medium">{field.value ?? "—"}</span>
          )}
        </div>
        {field.ai_value != null && field.ai_value !== field.value && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1">AI said: {field.ai_value}</p>
        )}
      </div>
    </div>
  );
}

function EmptyFieldRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-sm border border-transparent text-[var(--muted-foreground)]">
      <span className="text-xs font-medium">{label}</span>
      <span className="ml-auto text-[var(--muted-foreground)] italic">not extracted</span>
    </div>
  );
}

function CrossCheckRow({ check, onJump }: { check: any; onJump: () => void }) {
  const failed = check.status === "fail";
  return (
    <div className={`p-2 rounded-sm border ${
      failed ? "border-red-200 bg-red-50" : "border-[var(--border)] bg-[var(--card)]"
    }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
          {check.check_type.replace(/_/g, " ")}
        </span>
        <Badge variant={failed ? "destructive" : "success"} className="text-[var(--foreground)] text-[10px]">
          {check.status}
        </Badge>
      </div>
      {failed ? (
        <div className="text-xs text-[var(--muted-foreground)] space-y-1">
          <div className="flex justify-between">
            <span className="text-[var(--destructive)]">Value A:</span> <span>{check.value_a}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--destructive)]">Value B:</span> <span>{check.value_b}</span>
          </div>
          {check.delta && (
            <div className="flex justify-between">
              <span className="text-[var(--destructive)]">Delta:</span> <span>{check.delta}</span>
            </div>
          )}
          <button onClick={onJump} className="text-[var(--primary)] text-xs underline mt-1">Jump to field</button>
        </div>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)] italic">Passed</p>
      )}
    </div>
  );
}

function DocumentViewer({
  doc,
  signedUrl,
  pageNo,
  onPageChange,
}: {
  doc: any;
  signedUrl: string;
  pageNo: number;
  onPageChange: (n: number) => void;
}) {
  const isPdf = doc.mime_type === "application/pdf";
  const src = isPdf ? `${signedUrl}#page=${pageNo}` : signedUrl;
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--muted)]/40 rounded-sm border border-[var(--border)]/50">
      {isPdf ? (
        <embed src={src} type="application/pdf" className="w-full h-full" />
      ) : (
        <img src={src} alt={doc.file_name} className="max-w-full max-h-full object-contain" />
      )}
    </div>
  );
}
