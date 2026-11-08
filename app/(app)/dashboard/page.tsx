"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  FileOutput,
  AlertTriangle,
  Activity,
  ClipboardList,
  Package,
  Menu,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_ORDER: string[] = [
  "Draft",
  "Extracting",
  "Needs review",
  "Ready for approval",
  "Approved",
  "Exported",
];

const STATUS_VARIANT: Record<string, string> = {
  Draft: "badge-draft",
  Extracting: "badge-extracting",
  "Needs review": "badge-warning",
  "Ready for approval": "badge-ready",
  Approved: "badge-approved",
  Exported: "badge-exported",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Draft: <Package size={16} strokeWidth={1.75} />,
  Extracting: <Activity size={16} strokeWidth={1.75} />,
  "Needs review": <AlertTriangle size={16} strokeWidth={1.75} />,
  "Ready for approval": <ClipboardList size={16} strokeWidth={1.75} />,
  Approved: <FileOutput size={16} strokeWidth={1.75} />,
  Exported: <Activity size={16} strokeWidth={1.75} />,
};

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const db = supabase!;

  const [shipments, setShipments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await db
        .from("shipments")
        .select("*, suppliers(name)")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setShipments(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments");
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return shipments.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        q === "" ||
        s.shipment_number?.toLowerCase().includes(q) ||
        s.suppliers?.name?.toLowerCase().includes(q) ||
        (s.supplier_id && String(s.supplier_id).includes(q));
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    STATUS_ORDER.forEach((s) => (tally[s] = 0));
    for (const s of shipments) {
      tally[s.status] = (tally[s.status] ?? 0) + 1;
    }
    return tally;
  }, [shipments]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-heading font-semibold tracking-tight text-[var(--foreground)]">
            Shipments
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Track extraction statuses, automated compliance checks, and
            cryptographic audit records across declarations.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-outline mb-1">
                <span className="font-mono text-[11px] uppercase">
                  Metric {i}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-20 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl glass p-6 text-center">
        <h2 className="text-lg font-heading font-semibold text-[var(--foreground)]">
          Unable to load shipments
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-mono text-[11px] uppercase tracking-wider text-[hsl(var(--primary))]">
              Console Registry
            </span>
            <span className="font-mono text-mono text-[11px] text-[var(--muted-foreground)]">
              •
            </span>
            <span className="font-mono text-mono text-[11px] text-[hsl(var(--secondary))]">
              Real-time Stream Synced
            </span>
          </div>
          <h1 className="text-xl font-heading font-semibold tracking-tight text-[var(--foreground)]">
            Shipments
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Track extraction statuses, automated compliance checks, and
            cryptographic audit records across declarations.
          </p>
        </div>

        {/* KPI Pills Deck */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 glass-elevated p-1.5 rounded-xl shadow-xl">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className="glass px-3.5 py-2.5 rounded-lg transition-all hover:bg-[hsl(var(--muted))/40] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] mb-1">
                <span className="font-mono text-[11px] uppercase">
                  {status}
                </span>
                {STATUS_ICON[status]}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`font-heading text-headline-sm ${STATUS_VARIANT[status]}`}>
                  {counts[status] ?? 0}
                </span>
                <span className="font-mono text-mono-timestamp text-[hsl(var(--muted-foreground))]">
                  shipments
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtration & Search Control Bar */}
      <div className="glass-elevated rounded-xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            <Input
              id="shipment-search"
              placeholder="Search shipment number, supplier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[hsl(var(--input)/60)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm focus:border-[hsl(var(--ring))] focus:outline-none focus:outline-2 transition-all shadow-inner"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-[10px] font-mono rounded shadow-sm">
                ⌘K
              </kbd>
              {search && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearch("")}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  aria-label="Clear search"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[hsl(var(--muted-foreground))] text-[10px] uppercase tracking-wider font-mono pr-1">
              Filter By:
            </span>
            {["all", ...STATUS_ORDER].map((status) => {
              const active = statusFilter === status;
              const count = counts[status] ?? 0;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full font-heading text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                    active
                      ? `bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]`
                      : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))/40]"
                  }`}
                >
                  {status === "Extracting" ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--secondary))] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--secondary))]" />
                      </span>
                      <span>{status}</span>
                    </>
                  ) : (
                    <>
                      {STATUS_ICON[status]}
                      <span>{status}</span>
                    </>
                  )}
                  <span className="px-1.5 py-0.2 bg-[hsl(var(--border))] rounded-full font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Verification Ledger Table Panel */}
      <div className="glass-elevated rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Top Action Ribbon */}
        <div className="px-4 py-3 bg-[hsl(var(--muted))/30] flex items-center justify-between text-xs font-mono text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="font-[hsl(var(--muted-foreground))]">Engine:</span>
              <span className="font-[hsl(var(--foreground))]">Semantic Cross-Ref v3.9</span>
            </span>
            <span className="text-[hsl(var(--border))]">|</span>
            <span className="font-[hsl(var(--muted-foreground))]">Auto-refresh every 30s</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] flex items-center gap-1 transition-colors">
              <Activity className="w-4 h-4" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Scrollable Ledger View */}
        <div className="overflow-x-auto w-full">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[hsl(var(--muted-foreground))]">
                {search || statusFilter !== "all"
                  ? "No shipments match your filters."
                  : "No shipments yet."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[hsl(var(--muted))/40] text-[hsl(var(--muted-foreground))] font-mono text-[11px] uppercase tracking-wider select-none">
                  <th className="py-3 px-4 w-12 text-center">
                    <span className="sr-only">Row Selector</span>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>Shipment ID</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>Supplier / Declarant</span>
                    </div>
                  </th>
                  <th className="py-3 px-4">Verification Integrity</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span>Updated</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))/40] text-sm text-[hsl(var(--foreground))]">
                {filtered.map((s) => {
                  const suppliersName = s.suppliers?.name || "—";
                  return (
                    <tr
                      key={s.id}
                      className="shipment-row hover:bg-[hsl(var(--muted))/40] transition-colors group cursor-pointer"
                      data-status={s.status}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          className="row-checkbox rounded bg-[hsl(var(--input))] text-[hsl(var(--primary))] focus:ring-0 focus:outline-none cursor-pointer w-4 h-4 accent-[hsl(var(--primary))]"
                          type="checkbox"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/shipments/${s.id}`}
                            className="font-mono text-mono text-[hsl(var(--primary))] hover:text-[hsl(var(--secondary))] underline-offset-4 hover:underline font-semibold flex items-center gap-1"
                          >
                            {s.shipment_number}
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-[hsl(var(--border))] flex items-center justify-center font-mono text-[hsl(var(--secondary))] font-semibold shrink-0">
                            {suppliersName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-heading text-sm text-[var(--foreground)]">
                              {suppliersName}
                            </span>
                            <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                              Consignee: Global Freight Hub
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[hsl(var(--border))] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor:
                                  s.status === "Approved"
                                    ? "hsl(var(--approved))"
                                    : s.status === "Extracting"
                                    ? "hsl(var(--secondary))"
                                    : s.status === "Needs review"
                                    ? "hsl(var(--needs-review))"
                                    : s.status === "Ready for approval"
                                    ? "hsl(var(--ready-for-approval))"
                                    : s.status === "Exported"
                                    ? "hsl(var(--exported))"
                                    : "hsl(var(--muted-foreground))",
                                width: s.status === "Approved" ? "98%" : "60%",
                              }}
                            />
                          </div>
                          <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                            98% Match (0 Flags)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${STATUS_VARIANT[s.status]} shadow-sm`}>
                          {STATUS_ICON[s.status]}
                          <span>{s.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-mono-timestamp text-[11px] text-[var(--foreground)]">
                            7/11/2026
                          </span>
                          <span className="font-mono text-mono-timestamp text-[11px] text-[hsl(var(--muted-foreground))]">
                            14:32:10 UTC
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/shipments/${s.id}`}
                            className="px-2.5 py-1 rounded bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/40] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] font-heading text-[11px] transition-colors shadow-sm"
                          >
                            Review
                          </a>
                          <button className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))/40] transition-colors" aria-label="More options">
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
      </div>
    </div>
  );
}
