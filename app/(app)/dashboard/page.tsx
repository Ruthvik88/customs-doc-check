"use client";

import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Search, RefreshCw, Download, CloudUpload, ClipboardCheck, ChevronLeft, ChevronRight, MoreVertical, X } from "lucide-react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["Draft", "Extracting", "Needs review", "Ready for approval", "Approved", "Exported"] as const;

const STATUS_VARIANT: Record<string, "confirmed" | "error" | "review" | "progress" | "neutral"> = {
  Approved: "confirmed",
  Exported: "confirmed",
  "Needs review": "review",
  Extracting: "progress",
  Draft: "neutral",
};

type Shipment = {
  id: string;
  shipment_number: string;
  supplier_id: string | null;
  status: string;
  updated_at: string | null;
  suppliers: { name: string }[] | { name: string } | null;
};

function supplierName(supplier: Shipment["suppliers"]) {
  return Array.isArray(supplier) ? supplier[0]?.name : supplier?.name;
}

function MetricCard({
  status,
  label,
  count,
  subtitle,
  active,
  onClick,
}: {
  status: string;
  label: string;
  count: number;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col p-3 rounded-xl border shadow-sm transition-all duration-200 ${
        active
          ? "border-customs-primary ring-1 ring-customs-primary bg-customs-surface-container-low/40"
          : "border-customs-border-hairline bg-customs-surface-raised hover:bg-customs-surface-container-low hover:border-customs-outline-variant"
      }`}
    >
      <div className="flex items-start justify-between text-customs-ink-muted mb-1">
        <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span className="font-headline-xl text-headline-xl font-bold text-customs-ink-primary tracking-tight leading-none">
            {count}
          </span>
        </div>
        <div className="font-caption text-caption text-customs-ink-secondary">{subtitle}</div>
      </div>
    </button>
  );
}

export default function ShipmentsPage() {
  const supabase = useSupabaseClient();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      setError("Shipment data is unavailable because Supabase is not configured.");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("shipments")
      .select("id, shipment_number, supplier_id, status, updated_at, suppliers(name)")
      .order("updated_at", { ascending: false });
    if (queryError) {
      setShipments([]);
      setError(`Could not load shipments: ${queryError.message}`);
    } else {
      setShipments((data ?? []) as Shipment[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return shipments.filter((s) => {
      const matchesSearch =
        !q ||
        s.shipment_number.toLocaleLowerCase().includes(q) ||
        supplierName(s.suppliers)?.toLocaleLowerCase().includes(q) ||
        s.supplier_id?.toLocaleLowerCase().includes(q);
      return matchesSearch && (statusFilter === "all" || s.status === statusFilter);
    });
  }, [shipments, search, statusFilter]);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const s of shipments) {
      result[s.status] = (result[s.status] ?? 0) + 1;
    }
    return result;
  }, [shipments]);

  const filtersApplied = search.trim().length > 0 || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading shipments">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-semibold tracking-tight text-customs-ink-primary">Shipments</h1>
            <p className="text-sm text-customs-ink-secondary">Current shipment status and recent updates.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["all", ...STATUS_ORDER].map((status) => (
            <div key={status} className="glass rounded-xl p-4">
              <div className="h-3 w-20 bg-customs-surface-container-high rounded animate-pulse"></div>
              <div className="mt-3 h-8 w-24 bg-customs-surface-container-low rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-4"><div className="h-10 w-full bg-customs-surface-container-high rounded animate-pulse"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-customs-status-error-bg bg-customs-status-error-bg/20 p-6 shadow-sm" role="alert">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-lg bg-customs-error text-customs-on-error flex items-center justify-center shrink-0 shadow-sm">
            <MoreVertical className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="shipment-unavailable-heading" className="font-headline-md text-headline-md font-bold text-customs-ink-primary mb-1">
              Shipments Data Unavailable
            </h2>
            <p className="font-body-md text-body-md text-customs-ink-secondary">
              {error}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => void load()}
            className="bg-customs-primary text-customs-on-primary-container font-headline-sm text-headline-sm flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-label-code-sm text-label-code-sm uppercase tracking-wider text-customs-ink-secondary">
            <span>PORT OF ENTRY: ROTTERDAM (NLRTM)</span>
            <span>/</span>
            <span className="text-customs-ink-secondary">MANIFEST VERIFICATION</span>
            <span>/</span>
            <span className="text-customs-primary font-semibold">SHIPMENTS LIVE QUEUE</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-customs-ink-primary tracking-tight">Active Consignments</h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-on-surface-variant font-label-code-sm text-label-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-customs-ink-secondary animate-pulse"></span>
              <span>CYCLE: 14:00 CET</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-customs-surface-raised px-4 py-2.5 rounded-xl shadow-sm border border-customs-border-hairline">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-customs-ink-muted uppercase">SLA Target</span>
            <span className="font-label-code-md text-label-code-md font-semibold text-customs-ink-primary">&lt; 14m</span>
          </div>
        </div>
      </div>

      {/* Metric filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8" id="metric-filter-group">
        <MetricCard
          status="all"
          label="Total Consignments"
          count={shipments.length}
          subtitle="24h EDI file intake"
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {STATUS_ORDER.map((status) => (
          <MetricCard
            key={status}
            status={status}
            label={status}
            count={counts[status] ?? 0}
            subtitle={status === "Draft" ? "Document mismatch alerts" : status === "Extracting" ? "Processing" : status === "Approved" ? "Compliant transmission" : "Pending review"}
            active={statusFilter === status}
            onClick={() => setStatusFilter(status)}
          />
        ))}
      </div>

      {/* Operational filter & search toolbar */}
      <div className="p-3 bg-customs-surface-raised rounded-xl shadow-sm mb-4 border border-customs-border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <div className="relative w-full lg:w-80 flex-shrink-0">
            <Icon as={Search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-customs-ink-muted" aria-hidden="true" />
            <Input
              id="shipment-search"
              type="search"
              label="Search shipments"
              placeholder="Filter by Consignor, BL, HS code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-customs-surface-base text-customs-ink-primary placeholder:text-customs-ink-muted font-label-code-md text-label-code-md rounded-lg focus:outline-none focus:ring-2 focus:ring-customs-primary/20 transition-all border-transparent focus:border-customs-primary"
            />
            {search.length > 0 && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-customs-ink-muted hover:text-customs-ink-primary p-0.5"
                onClick={() => setSearch("")}
                title="Clear search text"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <Button type="button" variant="outline" size="sm" onClick={clearFilters} disabled={!filtersApplied}>
            Clear filters
          </Button>
          <Button type="button" variant="outline" size="sm">
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Manifest (CSV)
          </Button>
          <Button type="button" size="sm">
            <CloudUpload className="w-4 h-4" aria-hidden="true" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <div className="bg-customs-surface-raised rounded-xl shadow-sm border border-customs-border-hairline flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-customs-surface-base flex items-center justify-center text-customs-ink-muted mb-3">
            <X className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-customs-ink-primary">No matching shipments found</h3>
          <p className="font-body-md text-body-md text-customs-ink-secondary max-w-lg mb-8 leading-relaxed">
            No records match your query or active filter. Try resetting search parameters.
          </p>
          <button className="mt-4 px-3.5 py-1.5 rounded-lg bg-customs-surface-base hover:bg-customs-surface-container-low text-customs-primary font-body-md text-body-md font-medium transition-colors" onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-customs-surface-raised rounded-xl shadow-sm border border-customs-border-hairline overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse" id="shipments-table">
              <thead>
                <tr className="bg-customs-surface-base text-customs-ink-secondary font-caption text-caption uppercase tracking-wider h-10 border-b border-customs-border-hairline select-none">
                  <th className="px-5 py-2 font-semibold">Shipment</th>
                  <th className="px-5 py-2 font-semibold">Supplier / Forwarder</th>
                  <th className="px-5 py-2 font-semibold">Status</th>
                  <th className="px-5 py-2 font-semibold">Updated</th>
                  <th className="px-5 py-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-customs-border-hairline" id="table-body">
                {filtered.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-customs-surface-container-low/60 transition-colors group" data-shipment={shipment.shipment_number} data-status={shipment.status} data-supplier={supplierName(shipment.suppliers) ?? ""}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Link href={`/dashboard/${shipment.id}`} className="font-label-code-md text-label-code-md font-semibold text-customs-primary hover:underline flex items-center gap-1 no-underline">
                          {shipment.shipment_number}
                        </Link>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-customs-surface-container text-customs-on-secondary-container">
                          Air Cargo
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-body-md text-body-md text-customs-ink-primary font-medium">{supplierName(shipment.suppliers) || "—"}</span>
                        <span className="font-caption text-caption text-customs-ink-muted">Consignment #{shipment.shipment_number} • 4 Docs attached</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge variant={STATUS_VARIANT[shipment.status] ?? "neutral"} label={shipment.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-label-code-sm text-label-code-sm text-customs-ink-secondary">
                        {shipment.updated_at ? new Date(shipment.updated_at).toLocaleString() : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-md hover:bg-customs-surface-container-low text-customs-ink-secondary hover:text-customs-ink-primary"
                          title={shipment.status === "Needs review" ? "Review Discrepancies" : "View details"}
                        >
                          {shipment.status === "Needs review" ? <ClipboardCheck className="w-4 h-4" aria-hidden="true" /> : <MoreVertical className="w-4 h-4" aria-hidden="true" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination footer */}
          <div className="bg-customs-surface-raised px-5 py-3.5 border-t border-customs-border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 font-caption text-caption text-customs-ink-secondary">
            <div className="flex items-center gap-2">
              <span>Showing <strong className="text-customs-ink-primary font-medium">{filtered.length}</strong> of <strong className="text-customs-ink-primary font-medium">{shipments.length}</strong> shipments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="h-8 px-2.5 rounded-md border border-customs-border-hairline bg-customs-surface-raised text-customs-ink-secondary disabled:opacity-40 disabled:cursor-not-allowed font-medium inline-flex items-center gap-1" disabled>
                <span>Previous</span>
              </button>
              <div className="flex items-center gap-1 px-1">
                <button className="w-8 h-8 rounded-md bg-customs-primary text-customs-on-primary-container font-semibold font-label-code-sm text-label-code-sm flex items-center justify-center shadow-xs">
                  1
                </button>
              </div>
              <button className="h-8 px-2.5 rounded-md border border-customs-border-hairline bg-customs-surface-raised text-customs-ink-primary font-medium inline-flex items-center gap-1">
                <span>Next</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
