"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Database,
  Download,
  Lock,
  MapPin,
  Package,
  Plane,
  RefreshCw,
  CheckCheck,
  LayoutDashboard,
  ShieldCheck,
  Sun,
  User,
  X,
  Moon,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useSession } from "@/hooks/useSession";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

type Shipment = {
  id: string;
  shipment_number: string;
  status: string;
  supplier_id: string | null;
  updated_at: string | null;
  approved_at: string | null;
  suppliers: { name: string }[] | { name: string } | null;
};

function supplierName(suppliers: Shipment["suppliers"]) {
  return Array.isArray(suppliers) ? suppliers[0]?.name : suppliers?.name;
}

type RowExportState = "idle" | "generating" | "done" | "failed";

export default function ExportPage() {
  const { role } = useSession();
  const supabase = useSupabaseClient();
  const isManager = role === "documentation_manager";

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState<Record<string, RowExportState>>({});
  const [downloadBytes, setDownloadBytes] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!isManager) return;
    setDataLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase!
        .from("shipments")
        .select("*, suppliers(name)")
        .eq("status", "Approved")
        .order("approved_at", { ascending: false });
      if (queryError) throw queryError;
      setShipments((data ?? []) as Shipment[]);
    } catch (err) {
      setShipments([]);
      setError(
        err instanceof Error ? err.message : "Failed to load approved shipments",
      );
    } finally {
      setDataLoading(false);
    }
  }, [supabase, isManager]);

  useEffect(() => {
    if (isManager) {
      void load();
    }
  }, [isManager, load]);

  const clearedCount = useMemo(() => shipments.length, [shipments]);

  async function exportShipment(id: string) {
    setExporting((prev) => ({ ...prev, [id]: "generating" }));
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: id }),
      });
      if (res.status === 409) {
        const j = await res.json().catch(() => ({}));
        setExporting((prev) => ({ ...prev, [id]: "failed" }));
        setError(j.error || "Export blocked");
        return;
      }
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("content-disposition")
          ?.match(/filename="([^"]+)"/)?.[1] || "export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadBytes((prev) => ({ ...prev, [id]: blob.size }));
      setExporting((prev) => ({ ...prev, [id]: "done" }));
      void load(); // refresh: status becomes Exported
    } catch (err) {
      setExporting((prev) => ({ ...prev, [id]: "failed" }));
      setError(err instanceof Error ? err.message : "Export failed");
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

  if (!supabase) {
    return (
      <div className="rounded-xl glass p-6 text-center">
        <h2 className="text-lg font-headline font-semibold text-customs-ink-primary">
          Configuration error
        </h2>
        <p className="text-sm text-customs-ink-secondary">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the dev server.
        </p>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <main className="w-full pt-16 flex-1 bg-customs-surface">
          <div className="flex flex-col w-full">
            <div className="w-full px-8 py-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-p-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-label-code text-label-code-sm uppercase tracking-wider text-customs-primary">
                      Compliance Clearance Hub
                    </span>
                    <span className="w-1 h-1 rounded-full bg-customs-ink-muted" aria-hidden="true" />
                    <span className="font-label-code text-label-code-sm text-customs-ink-muted">
                      GATEWAY REGION: IN-NSA-1
                    </span>
                  </div>
                  <h1 className="font-headline text-headline-xl text-customs-ink-primary tracking-tight">
                    Export Shipments
                  </h1>
                  <p className="font-body text-body-md text-customs-ink-secondary">
                    One row per line item, in the filing software&apos;s import layout
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-customs-surface-container-high px-4 py-1 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-customs-primary opacity-75" aria-hidden="true" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-customs-primary" aria-hidden="true" />
                    </div>
                    <span className="font-label-code text-label-code-sm text-customs-ink-primary tracking-tight">
                      ICEGATE 2.1 PROTOCOL ACTIVE
                    </span>
                  </div>
                  <div className="h-3 w-px bg-customs-outline-variant" />
                  <span className="font-caption text-caption text-customs-ink-secondary uppercase">
                    Node: NSA-VAL-09
                  </span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-customs-status-progress-bg px-6 py-3.5 shadow-sm">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-customs-surface-raised flex items-center justify-center text-customs-status-progress-text shadow-sm flex-shrink-0">
                      <Icon as={RefreshCw} size={16} className="animate-spin" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-body text-body-md font-semibold text-customs-status-progress-text">
                        Querying approved clearance manifest registry…
                      </span>
                      <span className="hidden sm:inline-block text-customs-status-progress-text opacity-40">
                        &bull;
                      </span>
                      <span className="font-label-code text-label-code-sm text-customs-status-progress-text opacity-85">
                        Encrypted ICEGATE node handshake
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto pl-10 sm:pl-0">
                    <div className="h-1.5 w-24 bg-customs-surface-raised rounded-full overflow-hidden">
                      <div className="h-full bg-customs-primary rounded-full animate-pulse w-3/5" />
                    </div>
                    <span className="font-label-code text-label-code-sm text-customs-status-progress-text font-semibold">
                      EST 1.2s
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-customs-surface-raised shadow-md overflow-hidden flex flex-col">
                <div className="p-4 bg-customs-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-80">
                    <div className="relative w-full h-9 bg-customs-surface-base rounded-lg overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_8s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-9 bg-customs-surface-base rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_8s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                    </div>
                    <div className="w-24 h-9 bg-customs-surface-base rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_8s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                    </div>
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[860px]">
                    <thead>
                      <tr className="h-10 bg-customs-surface-base text-customs-ink-secondary">
                        {[26, 28, 18, 16, 12].map((pct, i) => (
                          <th key={i} className={`px-6 w-[${pct}%]`} scope="col">
                            <div className="flex items-center gap-2">
                              <div className="h-3 bg-customs-surface-dim rounded relative overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                              </div>
                              <span className="font-caption text-caption text-customs-ink-secondary uppercase tracking-wider font-semibold">
                                {i === 0 ? "SHIPMENT" : i === 1 ? "SUPPLIER" : i === 2 ? "APPROVED BY" : i === 3 ? "APPROVED ON" : "EXPORT"}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-customs-surface-raised divide-none">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={i} className={`h-16 ${i % 2 === 0 ? "bg-customs-surface-container-low/20" : ""}`}>
                          <td className="px-6 py-2">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`h-4 w-${i % 2 === 0 ? 36 : 32} bg-customs-surface-dim rounded font-label-code-md relative overflow-hidden`}>
                                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                                </div>
                                <div className={`h-4 w-${i % 2 === 0 ? 10 : 12} bg-customs-status-confirmed-bg/60 rounded-full relative overflow-hidden`}>
                                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                                </div>
                              </div>
                              <div className={`h-3 w-${i % 2 === 0 ? 36 : 44} bg-customs-surface-base rounded relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-col gap-1">
                              <div className={`h-4 w-${i % 2 === 0 ? 40 : 48} bg-customs-surface-dim rounded relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                              <div className={`h-3 w-${i % 2 === 0 ? 24 : 28} bg-customs-surface-base rounded relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-customs-surface-dim relative overflow-hidden flex-shrink-0">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                              <div className={`h-3.5 w-${i % 2 === 0 ? 24 : 28} bg-customs-surface-dim rounded relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-col gap-1">
                              <div className={`h-3.5 w-${i % 2 === 0 ? 24 : 28} bg-customs-surface-dim rounded font-label-code-sm relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                              <div className={`h-3 w-${i % 2 === 0 ? 16 : 20} bg-customs-surface-base rounded relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-2 text-right">
                            <div className="inline-flex justify-end">
                              <div className="h-9 w-24 bg-customs-primary/20 rounded-lg relative overflow-hidden shadow-sm">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-customs-surface-raised flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-32 bg-customs-surface-dim rounded relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 bg-customs-surface-base rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-customs-ink-secondary px-1">
                <div className="flex items-center gap-2">
                  <Icon as={Lock} size={16} className="text-customs-ink-secondary" aria-hidden="true" />
                  <span className="font-caption text-caption text-customs-ink-secondary">
                    Filing Engine Integration: Auto-formatted for direct manifest ingestion (Form 8-B).
                  </span>
                </div>
                <div className="font-label-code text-label-code-sm text-customs-ink-muted">
                  TLS 1.3 / AES-256 GCM
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="rounded-xl glass p-12 text-center">
        <h2 className="text-lg font-headline font-semibold text-customs-ink-primary">
          Export
        </h2>
        <p className="text-sm text-customs-ink-secondary">
          Only the documentation manager can export shipments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-customs-surface font-body text-body-md text-customs-on-surface min-h-screen flex flex-col">

      <main className="w-full pt-16 flex-1 bg-customs-surface">
        <div className="flex flex-col w-full">
          <div className="w-full px-8 py-6 flex flex-col gap-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline text-headline-xl text-customs-ink-primary tracking-tight">
                    Export Shipments
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-primary font-caption text-caption uppercase tracking-wider font-semibold">
                    Manager Only &bull; Direct Customs ERP &amp; Filing Interface
                  </span>
                </div>
                <p className="font-body text-body-md text-customs-ink-secondary">
                  One row per line item, in the filing software&apos;s import layout
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-customs-status-error-bg bg-customs-status-error-bg/20 p-4 shadow-sm flex items-start gap-2">
                <Icon as={X} size={16} className="text-customs-status-error-text shrink-0" aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-body-sm text-body-sm font-bold text-customs-status-error-text">
                    Export failed
                  </span>
                  <p className="font-caption text-caption text-customs-status-error-text/90">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="mt-1" type="button">
                  <Icon as={RefreshCw} size={16} className="text-customs-ink-secondary mr-2" aria-hidden="true" />
                  Retry
                </Button>
              </div>
            )}

            {/* Table container */}
            <div className="bg-customs-surface-raised rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Table header */}
              <div className="px-6 py-4 bg-customs-surface-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon as={CheckCheck} size={20} className="text-customs-status-confirmed-text" aria-hidden="true" />
                  <span className="font-headline text-headline-sm text-customs-ink-primary">
                    Verified Approved Consignments
                  </span>
                  <span className="ml-1 px-2 py-0.5 rounded-md bg-customs-surface-container text-customs-ink-secondary font-label-code text-label-code-sm">
                    {clearedCount} Records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-customs-ink-secondary">
                    Single-click row execution runs the export.
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-customs-surface-base text-customs-ink-secondary font-caption text-caption uppercase tracking-wider">
                      <th className="py-3 px-6 font-semibold" scope="col">
                        Shipment
                      </th>
                      <th className="py-3 px-4 font-semibold" scope="col">
                        Supplier
                      </th>
                      <th className="py-3 px-4 font-semibold" scope="col">
                        Approved On
                      </th>
                      <th className="py-3 px-6 text-right font-semibold" scope="col">
                        Actions / Export
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0 text-customs-ink-primary">
                    {shipments.length === 0 && (
                      <tr>
                        <td className="px-6 py-6 text-center text-customs-ink-secondary" colSpan={4}>
                          No approved shipments ready for export.
                        </td>
                      </tr>
                    )}
                    {shipments.length === 0 && (
                      <tr>
                        <td className="px-6 py-8" colSpan={4}>
                          <div className="bg-customs-surface-raised rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[460px]">
                            <h2 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight mb-p-2">
                              No approved shipments yet
                            </h2>
                            <p className="font-body text-body-md text-customs-ink-secondary max-w-xl mx-auto leading-relaxed mb-p-8">
                              Shipments must complete document verification and
                              receive manager approval before export CSVs can be
                              generated. Once a shipment is approved, it will
                              automatically appear here ready for filing.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                              <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-customs-primary text-customs-on-primary font-headline-sm text-headline-sm rounded-lg hover:bg-customs-primary-container transition-colors shadow-sm"
                              >
                                <Icon as={CheckCheck} size={16} aria-hidden="true" />
                                <span>View Pending Approvals</span>
                              </Link>
                              <Link
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-customs-surface-base text-customs-ink-primary font-headline-sm text-headline-sm rounded-lg hover:bg-customs-surface-container transition-colors"
                              >
                                <Icon as={LayoutDashboard} size={16} className="text-customs-ink-secondary" aria-hidden="true" />
                                <span>Go to Shipments Dashboard</span>
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {shipments.map((shipment) => {
                      const state = exporting[shipment.id] ?? "idle";
                      const isGenerating = state === "generating";
                      const isDone = state === "done";
                      const isFailed = state === "failed";
                      const rowClass =
                        "hover:bg-customs-surface-container-low/40 transition-colors" +
                        (isFailed ? " bg-customs-status-error-bg/20" : "") +
                        (isGenerating ? " bg-customs-surface-container-low/20" : "");
                      return (
                        <tr key={shipment.id} className={rowClass}>
                          <td className="py-4 px-6 align-middle">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <span className="font-label-code text-label-code-md font-bold text-customs-ink-primary tracking-tight">
                                  {shipment.shipment_number}
                                </span>
                              </div>
                              <span className="font-label-code text-label-code-sm text-customs-ink-secondary mt-0.5">
                                {supplierName(shipment.suppliers) ?? "—"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="flex flex-col">
                              <span className="font-body text-body-md font-medium text-customs-ink-primary">
                                {supplierName(shipment.suppliers) ?? "—"}
                              </span>
                              <span className="font-body text-body-sm text-customs-ink-secondary flex items-center gap-1">
                                <Icon as={MapPin} size={16} aria-hidden="true" />
                                Consignment {shipment.shipment_number}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle">
                            <div className="flex flex-col">
                              <span className="font-label-code text-label-code-sm font-medium text-customs-ink-primary">
                                {shipment.approved_at
                                  ? new Date(shipment.approved_at).toISOString().replace("T", " ").slice(0, 19) + " UTC"
                                  : "—"}
                              </span>
                              {state !== "idle" && (
                                <span className="font-caption text-caption flex items-center gap-1 mt-1">
                                  {isGenerating ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-customs-status-confirmed-text animate-pulse" aria-hidden="true" />
                                      Generating CSV&hellip;
                                    </>
                                  ) : isDone ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-customs-status-confirmed-text" aria-hidden="true" />
                                      Exported
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-customs-status-error-text" aria-hidden="true" />
                                      Export failed
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 align-middle text-right">
                            {isGenerating ? (
                              <Button variant="primary" size="sm" className="flex items-center gap-2 px-4 py-1.5 text-body-sm text-body-md font-semibold" disabled type="button">
                                <Icon as={RefreshCw} size={16} className="animate-spin text-customs-primary" aria-hidden="true" />
                                <span>Generating CSV&hellip;</span>
                              </Button>
                            ) : isDone ? (
                              <Button variant="primary" size="sm" className="flex items-center gap-1 px-4 py-1.5 text-body-sm text-body-md font-semibold shadow-sm bg-customs-status-confirmed-bg text-customs-status-confirmed-text hover:bg-customs-status-confirmed-bg transition-colors" type="button">
                                <Icon as={CheckCheck} size={16} aria-hidden="true" />
                                <span>
                                  Downloaded {((downloadBytes[shipment.id] ?? 0) / 1024).toFixed(0)} KB
                                </span>
                              </Button>
                            ) : isFailed ? (
                              <div className="inline-flex items-center justify-end gap-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-customs-status-error-bg text-customs-status-error-text font-caption text-caption max-w-[240px] text-left">
                                  <Icon as={X} size={16} className="flex-shrink-0" aria-hidden="true" />
                                  <span className="truncate" title="Export failed">
                                    Export failed
                                  </span>
                                </div>
                                <Button variant="outline" size="sm" className="px-3 py-1.5 text-body-sm text-body-md font-semibold shadow-sm" onClick={() => void exportShipment(shipment.id)} type="button">
                                  <Icon as={RefreshCw} size={16} className="text-customs-ink-secondary" aria-hidden="true" />
                                  <span>Retry</span>
                                </Button>
                              </div>
                            ) : (
                              <Button variant="primary" size="sm" className="flex items-center gap-1.5 px-4 py-1.5 text-body-sm text-body-md font-semibold shadow-sm" onClick={() => void exportShipment(shipment.id)} type="button">
                                <Icon as={Download} size={16} className="text-customs-primary" aria-hidden="true" />
                                <span>Export CSV</span>
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination / Record summary footer */}
              <div className="flex items-center gap-2 font-body text-body-sm text-customs-ink-secondary">
                Showing <strong className="text-customs-ink-primary font-semibold">{clearedCount}</strong> of <strong className="text-customs-ink-primary font-semibold">{clearedCount}</strong> approved shipments ready for export
              </div>
            </div>

            {/* Export schema specification panel */}
            <div className="bg-customs-surface-container-low p-4 rounded-xl flex items-start gap-2">
              <Icon as={Database} size={20} className="text-customs-primary mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <span className="font-headline text-headline-sm text-customs-ink-primary">
                  Export Schema Specification
                </span>
                <p className="font-body text-body-sm text-customs-ink-secondary">
                  Generated CSV files follow the filing software import layout,
                  one row per line item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

