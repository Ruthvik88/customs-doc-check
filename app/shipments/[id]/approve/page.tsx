"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApprovePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const shipmentId = params.id;
  const { role, loading } = useSession();
  const supabase = useSupabaseClient();

  if (!supabase) return <Skeleton height="300" width="100%" />;

  const [shipment, setShipment] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [crosschecks, setCrosschecks] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  const isManager = role === "documentation_manager";

  useEffect(() => {
    if (!isManager) {
      setError("Only the documentation manager can approve shipments.");
      return;
    }
    load();
  }, [shipmentId, isManager]);

  async function load() {
    try {
      const [s, f, c] = await Promise.all([
        supabase!.from("shipments").select("*, suppliers(name)").eq("id", shipmentId).single(),
        supabase!.from("fields").select("*").eq("shipment_id", shipmentId).order("key"),
        supabase!.from("crosscheck_results").select("*").eq("shipment_id", shipmentId),
      ]);
      if (s.error) throw s.error;
      setShipment(s.data);
      setFields(f.data ?? []);
      setCrosschecks(c.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipment");
    }
  }

  const needsReview = fields.filter((f) => f.status === "needs_review" || f.status === "manual");
  const failed = crosschecks.filter((c) => c.status === "fail");
  const canApprove = isManager && needsReview.length === 0 && failed.length === 0;

  if (loading) return <Skeleton height="300" width="100%" />;
  if (!shipment) return <div className="text-[var(--muted-foreground)]">{error || "Shipment not found"}</div>;
  if (!isManager) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Manager approval</h2>
        <p className="text-[var(--muted-foreground)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Approve shipment</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {shipment.shipment_number} &nbsp;•&nbsp; {shipment.suppliers?.name || "—"}
          </p>
        </div>
        <Badge variant={statusVariant(shipment.status)} className="text-[var(--foreground)]">
          {shipment.status}
        </Badge>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="block text-[var(--muted-foreground)] text-xs">Supplier</span><span className="text-[var(--foreground)]">{shipment.suppliers?.name || "—"}</span></div>
          <div><span className="block text-[var(--muted-foreground)] text-xs">Currency</span><span className="text-[var(--foreground)]">{shipment.currency || "—"}</span></div>
          <div><span className="block text-[var(--muted-foreground)] text-xs">Incoterm</span><span className="text-[var(--foreground)]">{shipment.incoterm || "—"}</span></div>
          <div><span className="block text-[var(--muted-foreground)] text-xs">Gross weight</span><span className="text-[var(--foreground)]">{shipment.gross_weight_kg ?? "—"} kg</span></div>
        </div>
      </div>

      {/* Open issues */}
      <div className="card">
        <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
          Open issues {needsReview.length + failed.length > 0 ? `(${needsReview.length + failed.length})` : ""}
        </h2>
        {(needsReview.length === 0 && failed.length === 0) ? (
          <p className="text-xs text-[var(--success)]">No open issues — all fields confirmed and cross-checks pass.</p>
        ) : (
          <div className="space-y-2">
            {needsReview.map((f) => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-sm border border-[var(--border)]/50">
                <Badge variant="warning" className="text-[var(--warning)] text-[10px]">Needs review</Badge>
                <span className="text-xs text-[var(--foreground)]">{f.key}</span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">{f.value ?? "—"}</span>
              </div>
            ))}
            {failed.map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-2 rounded-sm border border-red-200 bg-red-50">
                <Badge variant="destructive" className="text-[var(--destructive)] text-[10px]">Failed check</Badge>
                <span className="text-xs text-[var(--foreground)]">{c.check_type.replace(/_/g, " ")}</span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">{c.delta}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve / reject */}
      <div className="card">
        <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">Decision</h2>
        {needsReview.length > 0 || failed.length > 0 ? (
          <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
            Cannot approve: resolve all flagged fields and failed cross-checks first.
          </div>
        ) : null}
        <div className="flex gap-3">
          <Button
            variant="primary"
            disabled={!canApprove || submitting}
            onClick={() => {
              if (canApprove) decide("approved");
            }}
          >
            {submitting ? "Submitting…" : "Approve shipment"}
          </Button>
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => {
              const r = window.prompt("Reason for rejection:");
              if (r !== null) decide("rejected", r);
            }}
          >
            Reject
          </Button>
        </div>
        {!canApprove && needsReview.length === 0 && failed.length === 0 ? null : null}
        <div className="mt-3 text-xs text-[var(--muted-foreground)]">
          Approval is recorded server-side; any later edit resets the shipment to "Needs review".
        </div>
      </div>

      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={() => router.push(`/shipments/${shipmentId}/review`)}>
          Back to review
        </Button>
      </div>
    </div>
  );

  async function decide(decision: "approved" | "rejected", reasonText = "") {
    setSubmitting(true);
    try {
      const { error: err } = await supabase!.rpc("shipment_approve", {
        p_shipment_id: shipmentId,
        p_decision: decision,
        p_reason: reasonText,
      });
      if (err) throw err;
      router.push(`/export?shipment=${shipmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision failed");
    } finally {
      setSubmitting(false);
    }
  }

  function statusVariant(status: string) {
    switch (status) {
      case "Approved": return "success";
      case "Needs review": return "warning";
      case "Extracting": case "Ready for approval": return "primary";
      default: return "outline";
    }
  }
}
