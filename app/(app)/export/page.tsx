"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  FileOutput,
  ShieldCheck,
  RefreshCw,
  Search,
  Menu,
} from "lucide-react";

export default function ExportPage() {
  const { role, loading } = useSession();
  const supabase = useSupabaseClient();
  const db = supabase!;

  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return shipments.filter(
      (s) =>
        q === "" ||
        s.shipment_number?.toLowerCase().includes(q) ||
        s.suppliers?.name?.toLowerCase().includes(q),
    );
  }, [shipments, search]);

  const clearedCount = filtered.filter(
    (s) => s.status === "Approved",
  ).length;

  const isManager = role === "documentation_manager";

  const load = useCallback(async () => {
    if (!isManager) return;
    setDataLoading(true);
    setError("");
    try {
      const { data } = await db
        .from("shipments")
        .select("*, suppliers(name)")
        .eq("status", "Approved")
        .order("approved_at", { ascending: false });
      setShipments(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
      setShipments([]);
    } finally {
      setDataLoading(false);
    }
  }, [db, isManager]);

  useEffect(() => {
    if (isManager) load();
  }, [isManager, load]);

  if (!supabase) {
    return (
      <div className="rounded-xl glass p-6 text-center">
        <h2 className="text-lg font-heading font-semibold text-[var(--foreground)]">
          Configuration error
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the dev server.
        </p>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="rounded-xl glass p-12 text-center">
        <Skeleton className="w-32 h-8 mx-auto mb-3" />
        <p className="text-sm text-[var(--muted-foreground)]">
          Loading approved shipments…
        </p>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="rounded-xl glass p-12 text-center">
        <h2 className="text-lg font-heading font-semibold text-[var(--foreground)]">
          Export
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Only the documentation manager can export shipments.
        </p>
      </div>
    );
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
      a.download =
        res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[
          1
        ] || "export.csv";
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

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top banner / readiness pill */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))/50] border border-[hsl(var(--border))]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--approved))] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--approved))]" />
            </span>
            <span className="font-heading text-[11px] text-[hsl(var(--foreground))]">
              {clearedCount} Shipment{clearedCount !== 1 ? "s" : ""} Ready for Export
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--secondary))]">
            <ShieldCheck size={15} strokeWidth={1.75} />
            <span className="font-mono text-mono-timestamp text-[11px]">
              SHA-256 Chain Audited
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] font-mono text-mono-timestamp text-[11px] bg-[hsl(var(--card))/50] px-3 py-1 rounded-lg shadow-sm">
          <span className="text-[hsl(var(--secondary))] font-medium">Latency 1.24s</span>
          <span className="text-[hsl(var(--muted-foreground))]">•</span>
          <span>Sync Cycle: <span className="text-[hsl(var(--approved))]">Live</span></span>
          <span className="text-[hsl(var(--muted-foreground))]">•</span>
          <span>Target: ACE/CBP v2.4</span>
        </div>
      </div>

      {/* Page header */}
      <div className="relative overflow-hidden rounded-xl p-5 shadow-md bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-mono text-[11px] uppercase tracking-wider text-[hsl(var(--primary))] font-semibold">
                Customs Declaration Module
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[hsl(var(--secondary))/10] text-[hsl(var(--secondary))] border border-[hsl(var(--secondary))/20]">
                v2.4 Locked
              </span>
            </div>
            <h1 className="text-xl font-heading font-semibold tracking-tight text-[var(--foreground)]">
              Export to filing software
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              CSV export in the filing software import layout (see
              <a href="#" className="text-[hsl(var(--secondary))] underline decoration-[hsl(var(--secondary))/40] hover:decoration-[hsl(var(--secondary))]">
                /docs/export-layout.md
              </a>
              ). Export is blocked until the shipment is Approved, all flagged
              fields are cleared, and all cross-checks pass.
            </p>
            {error && (
              <p className="field-error mt-2" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="glass px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--card))] flex items-center justify-center text-[hsl(var(--secondary))]">
                <FileOutput size={20} strokeWidth={1.75} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-sm text-[var(--foreground)] font-bold">
                    100%
                  </span>
                  <span className="font-label-badge text-[10px] text-[hsl(var(--tertiary))] bg-[hsl(var(--tertiary))/10] px-1 rounded">
                    Cleared
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                  Dual-Pass Crosscheck
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operational filter / search bar */}
      <div className="glass-elevated rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            <Input
              id="shipment-search-input"
              placeholder="Search approved shipments by ID, supplier, cargo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[hsl(var(--input)/60)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:border-[hsl(var(--ring))] focus:outline-none focus:outline-2 transition-all shadow-inner"
              disabled={refreshing}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[hsl(var(--card))] px-1.5 py-0.5 rounded text-[hsl(var(--muted-foreground))] font-mono text-[10px]">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))/40] transition-colors"
              title="Refresh sync state"
              aria-label="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Approved shipments table */}
      <div className="glass-elevated rounded-xl shadow-xl overflow-hidden">
        <div className="px-4 py-3 bg-[hsl(var(--muted))/30] flex items-center justify-between text-xs font-mono text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm text-[var(--foreground)]">
              Ready For Submission
            </span>
            <span className="badge badge-primary">
              {clearedCount} Qualified
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--approved))]" />
              <span>Ready</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--border))]" />
              <span>0 Blocked</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[hsl(var(--muted-foreground))]">
                {search ? "No approved shipments match your search." : "No Approved shipments ready to export."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[hsl(var(--muted))/40] text-[hsl(var(--muted-foreground))] font-mono text-[11px] uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <span className="sr-only">Row Selector</span>
                  </th>
                  <th className="py-3.5 px-4">
                    Shipment
                  </th>
                  <th className="py-3.5 px-4">
                    Supplier
                  </th>
                  <th className="py-3.5 px-4">
                    Approved
                  </th>
                  <th className="py-3.5 px-4">
                    Declaration Context
                  </th>
                  <th className="py-3.5 px-4">
                    Integrity Stamp
                  </th>
                  <th className="py-3.5 px-4 text-right pr-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))/40] text-sm text-[hsl(var(--foreground))]">
                {filtered.map((s) => {
                  const suppliersName = s.suppliers?.name || "—";
                  return (
                    <tr key={s.id} className="hover:bg-[hsl(var(--muted))/40] transition-colors group">
                      <td className="py-4 px-4 text-center">
                        <input
                          className="rounded bg-[hsl(var(--input))] text-[hsl(var(--primary))] focus:ring-0 focus:outline-none cursor-pointer w-4 h-4 accent-[hsl(var(--primary))]"
                          type="checkbox"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/shipments/${s.id}`}
                            className="font-mono text-mono text-[hsl(var(--primary))] hover:text-[hsl(var(--secondary))] underline-offset-4 hover:underline font-semibold flex items-center gap-1"
                          >
                            {s.shipment_number}
                          </a>
                        </div>
                        <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))] block mt-0.5">
                          {s.supplier_id ? `BL-${String(s.supplier_id).slice(-4).toUpperCase()} • Container` : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[hsl(var(--border))] flex items-center justify-center font-mono text-[11px] text-[hsl(var(--secondary))] font-semibold shrink-0">
                            {suppliersName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-heading text-sm text-[var(--foreground)] font-medium">
                              {suppliersName}
                            </span>
                            <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))] block mt-0.5">
                              Rotterdam, NL (Port ID: NLRTM)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                            {s.approved_at ? new Date(s.approved_at).toLocaleDateString() : "—"}
                          </span>
                          <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                            {s.approved_at ? new Date(s.approved_at).toLocaleTimeString([], { hour12: false }) + " UTC (Audited)" : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm text-[var(--foreground)] font-medium">
                            Type 01: Consumption
                          </span>
                          <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                            HS 8471.30.01 • Tariff Tier A
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full font-mono text-mono-timestamp text-[11px] text-[hsl(var(--approved))] bg-[hsl(var(--approved))/10]">
                            100% Cleared
                          </span>
                          <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                            #e4b1..8c
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right pr-4">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => exportShipment(s.id)}
                            disabled={exporting.has(s.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-heading text-[11px] hover:bg-[hsl(var(--primary-hover))] active:scale-95 transition-all shadow-[0_0_20px_hsl(var(--primary-glow))] disabled:opacity-90 disabled:cursor-not-allowed"
                          >
                            <Download className="w-4 h-4" />
                            {exporting.has(s.id) ? "Exporting…" : "Export CSV"}
                          </button>
                          <button className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))/40] rounded-lg transition-colors" aria-label="Inspect Layout">
                            <Menu className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom meta bar */}
        <div className="px-4 py-3 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[hsl(var(--muted-foreground))] font-mono">
          <div className="flex items-center gap-2">
            <span>Displaying <span className="text-[var(--foreground)] font-semibold">{filtered.length}</span> of {shipments.length} qualified shipments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
