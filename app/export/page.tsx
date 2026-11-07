"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExportPage() {
  const { role, loading } = useSession();
  const supabase = useSupabaseClient();
  const db = supabase!;

  const [shipments, setShipments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<Set<string>>(new Set());

  const isManager = role === "documentation_manager";

  useEffect(() => {
    if (!isManager) return;
    load();
  }, [isManager, db]);

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
      const { data } = await db
        .from("shipments")
        .select("*, suppliers(name)")
        .eq("status", "Approved")
        .order("approved_at", { ascending: false });
      setShipments(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
    }
  }

  async function exportShipment(id: string) {
    setExporting((prev) => new Set([...prev, id]));
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: id }),
      });
      if (res.status === 409) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Export blocked");
        return;
      }
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || "export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      load(); // refresh (status becomes Exported)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!isManager) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Export</h2>
        <p className="text-[var(--muted-foreground)]">Only the documentation manager can export shipments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Export to filing software</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          CSV export in the filing software import layout (see /docs/export-layout.md).
          Export is blocked until the shipment is Approved, all flagged fields are
          cleared, and all cross-checks pass.
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="card">
        {shipments.length === 0 ? (
          <p className="text-[var(--muted-foreground)] p-6">No Approved shipments ready to export.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <th className="pb-3 font-semibold">Shipment</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold">Approved</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)]">
                  <td className="pb-4 text-[var(--foreground)] font-medium">{s.shipment_number}</td>
                  <td className="pb-4">{s.suppliers?.name || "—"}</td>
                  <td className="pb-4 text-[var(--muted-foreground)]">{new Date(s.approved_at).toLocaleString()}</td>
                  <td className="pb-4 text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={exporting.has(s.id)}
                      onClick={() => exportShipment(s.id)}
                    >
                      {exporting.has(s.id) ? "Exporting…" : "Export CSV"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
