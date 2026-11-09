"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Fingerprint,
  Lock,
  MapPin,
  Package,
  Plane,
  RefreshCw,
  Shield,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function ExportApprovedPage() {
  return (
    <div className="bg-customs-surface font-body text-body-md text-customs-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-customs-surface-raised/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,27,45,0.04)]">
        <div className="h-16 w-full px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-p-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-customs-primary flex items-center justify-center text-customs-on-primary shadow-sm">
                <ShieldCheck className="text-[20px]" />
              </div>
              <span className="font-headline text-headline-sm text-customs-ink-primary tracking-tight whitespace-nowrap">
                Customs Doc Check
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-1 p-1 bg-customs-surface-container-low rounded-full" data-active-classes="bg-customs-primary text-customs-on-primary-container font-headline-sm rounded-lg">
              <Link href="/dashboard" className="px-4 py-1.5 transition-colors font-headline-sm text-headline-sm text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-low/50 rounded-full">
                Shipments
              </Link>
              <Link href="/reports" className="px-4 py-1.5 font-headline-sm text-headline-sm text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-low/50 rounded-full">
                Accuracy Report
              </Link>
              <Link href="/export" className="px-4 py-1.5 transition-colors bg-customs-primary text-customs-on-primary-container font-headline-sm rounded-full" aria-current="page">
                Export
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-full bg-customs-status-confirmed-bg text-customs-status-confirmed-text font-label-code text-label-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-customs-status-confirmed-text animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <div className="flex items-center gap-2 pl-p-2 border-l border-customs-border-hairline">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-label-code text-label-code-sm text-customs-ink-primary">
                  manager@demo.local
                </span>
                <div className="flex items-center justify-end gap-1">
                  <span className="inline-block px-1.5 py-0.25 bg-customs-secondary-container text-customs-on-secondary-container font-caption text-caption rounded">
                    DOCUMENTATION MANAGER
                  </span>
                </div>
              </div>
              <button aria-label="Toggle dark mode" className="w-8 h-8 rounded-lg flex items-center justify-center text-customs-ink-secondary hover:text-customs-ink-primary hover:bg-customs-surface-base transition-colors" type="button">
                <Shield className="text-[20px]" />
              </button>
              <div className="w-8 h-8 rounded-full bg-customs-primary flex items-center justify-center">
                <User className="text-customs-on-primary text-[18px]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 flex-1 bg-customs-surface">
        <div className="flex flex-col w-full">
          <div className="w-full px-8 py-6 flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline text-headline-xl text-customs-ink-primary tracking-tight">
                    Export Shipments
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-primary font-caption text-caption uppercase tracking-wider font-semibold">
                    Manager Only • Direct Customs ERP &amp; Filing Interface
                  </span>
                </div>
                <p className="font-body text-body-md text-customs-ink-secondary">
                  One row per line item, in the filing software&apos;s import layout
                </p>
              </div>
              {/* Quick Metrics Counter */}
              <div className="flex items-center gap-4 bg-customs-surface-raised px-4 py-2 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-customs-status-confirmed-text" />
                  <span className="font-caption text-caption text-customs-ink-secondary">Validation Engine</span>
                  <span className="font-label-code text-label-code-sm text-customs-status-confirmed-text font-semibold">
                    ISO-COMPLIANT
                  </span>
                </div>
                <div className="w-px h-4 bg-customs-surface-container-highest" />
                <div className="flex items-center gap-1.5 font-label-code text-label-code-sm text-customs-ink-primary">
                  <span className="text-customs-ink-secondary">Active Gateway:</span>
                  <span className="font-semibold text-customs-primary">ERP-SYNC-V4</span>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-customs-surface-raised rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Table Header */}
              <div className="px-6 py-4 bg-customs-surface-base flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-customs-status-confirmed-text text-[20px]" aria-hidden="true" />
                  <span className="font-headline text-headline-sm text-customs-ink-primary">
                    Verified Approved Consignments
                  </span>
                  <span className="ml-1 px-2 py-0.5 rounded-md bg-customs-surface-container text-customs-ink-secondary font-label-code text-label-code-sm">
                    5 Records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-customs-ink-secondary">
                    Single-click row execution applies digital signature &amp; logs audit trail
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-customs-surface-base text-customs-ink-secondary font-caption text-caption uppercase tracking-wider">
                      <th className="py-3 px-6 font-semibold" scope="col">
                        Shipment
                      </th>
                      <th className="py-3 px-4 font-semibold" scope="col">
                        Supplier &amp; Route
                      </th>
                      <th className="py-3 px-4 font-semibold" scope="col">
                        Approved By
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
                    {/* ROW 1: Default State (SHP-24811) */}
                    <tr className="hover:bg-customs-surface-container-low/40 transition-colors">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-label-code text-label-code-md font-bold text-customs-ink-primary tracking-tight">
                              SHP-24811
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-customs-surface-container-high text-customs-primary font-caption text-caption font-medium">
                              <Plane className="text-[12px] mr-1" aria-hidden="true" />
                              Air Cargo
                            </span>
                          </div>
                          <span className="font-label-code text-label-code-sm text-customs-ink-secondary mt-0.5">
                            FILING ID: FL-99201-EC
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md font-medium text-customs-ink-primary">
                            Pacific Logistics Corp
                          </span>
                          <span className="font-body text-body-sm text-customs-ink-secondary flex items-center gap-1">
                            <MapPin className="text-[13px]" aria-hidden="true" />
                            HKG &rarr; LAX • Consignment #89420
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md text-customs-ink-primary">
                            Marcus Vance
                          </span>
                          <span className="font-caption text-caption text-customs-ink-secondary">
                            Documentation Manager
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-label-code text-label-code-sm font-medium text-customs-ink-primary">
                            2026-07-11 15:45:02 UTC
                          </span>
                          <StatusBadge variant="confirmed" label="Verified Clearance" />
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <Button variant="primary" size="sm" className="flex items-center gap-1.5 px-4 py-1.5 text-body-sm text-body-md font-semibold shadow-sm" type="button">
                          <Download className="text-[18px] text-customs-primary" aria-hidden="true" />
                          <span>Export CSV</span>
                        </Button>
                      </td>
                    </tr>

                    {/* ROW 2: Loading State (SHP-24819) */}
                    <tr className="hover:bg-customs-surface-container-low/40 transition-colors bg-customs-surface-container-low/20">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-label-code text-label-code-md font-bold text-customs-ink-primary tracking-tight">
                              SHP-24819
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-customs-secondary-container text-customs-on-secondary-container font-caption text-caption font-medium">
                              <Package className="text-[12px] mr-1" aria-hidden="true" />
                              Ocean Freight
                            </span>
                          </div>
                          <span className="font-label-code text-label-code-sm text-customs-ink-secondary mt-0.5">
                            FILING ID: FL-88123-OC
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md font-medium text-customs-ink-primary">
                            Global Cargo Ltd
                          </span>
                          <span className="font-body text-body-sm text-customs-ink-secondary flex items-center gap-1">
                            <MapPin className="text-[13px]" aria-hidden="true" />
                            SGP &rarr; RTM • Consignment #11048
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md text-customs-ink-primary">
                            manager@demo.local
                          </span>
                          <span className="font-caption text-caption text-customs-ink-secondary">
                            Acting Customs Officer
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-label-code text-label-code-sm font-medium text-customs-ink-primary">
                            2026-07-11 14:12:18 UTC
                          </span>
                          <StatusBadge variant="confirmed" label="Signed via ERP Key" />
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <Button variant="primary" size="sm" className="flex items-center gap-2 px-4 py-1.5 text-body-sm text-body-md font-semibold" disabled type="button">
                          <RefreshCw className="animate-spin text-[18px] text-customs-primary" aria-hidden="true" />
                          <span>Generating CSV...</span>
                        </Button>
                      </td>
                    </tr>

                    {/* ROW 3: Success State (SHP-24810) */}
                    <tr className="hover:bg-customs-surface-container-low/40 transition-colors">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-label-code text-label-code-md font-bold text-customs-ink-primary tracking-tight">
                              SHP-24810
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-customs-surface-container-high text-customs-primary font-caption text-caption font-medium">
                              <Plane className="text-[12px] mr-1" aria-hidden="true" />
                              Air Cargo
                            </span>
                          </div>
                          <span className="font-label-code text-label-code-sm text-customs-ink-secondary mt-0.5">
                            FILING ID: FL-77341-EU
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md font-medium text-customs-ink-primary">
                            Trans-Pacific Cargo Network
                          </span>
                          <span className="font-body text-body-sm text-customs-ink-secondary flex items-center gap-1">
                            <MapPin className="text-[13px]" aria-hidden="true" />
                            PVG &rarr; ORD • Consignment #74992
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md text-customs-ink-primary">
                            Elena Rostova
                          </span>
                          <span className="font-caption text-caption text-customs-ink-secondary">
                            Compliance Director
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-label-code text-label-code-sm font-medium text-customs-ink-primary">
                            2026-07-11 11:15:20 UTC
                          </span>
                          <StatusBadge variant="confirmed" label="Pre-Audit Pass" />
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <Button variant="primary" size="sm" className="flex items-center gap-1 px-4 py-1.5 text-body-sm text-body-md font-semibold shadow-sm bg-customs-status-confirmed-bg text-customs-status-confirmed-text hover:bg-customs-status-confirmed-bg transition-colors" type="button">
                          <CheckCircle className="text-[18px]" aria-hidden="true" />
                          <span>Downloaded (24 KB)</span>
                        </Button>
                      </td>
                    </tr>

                    {/* ROW 4: Server-Error State (SHP-24802) */}
                    <tr className="hover:bg-customs-status-error-bg/10 transition-colors bg-customs-status-error-bg/20">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-label-code text-label-code-md font-bold text-customs-ink-primary tracking-tight">
                              SHP-24802
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-customs-secondary-container text-customs-on-secondary-container font-caption text-caption font-medium">
                              <Package className="text-[12px] mr-1" aria-hidden="true" />
                              Ocean Freight
                            </span>
                          </div>
                          <span className="font-label-code text-label-code-sm text-customs-ink-secondary mt-0.5">
                            FILING ID: FL-66380-IN
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md font-medium text-customs-ink-primary">
                            Shenzhen Precision Tech Co
                          </span>
                          <span className="font-body text-body-sm text-customs-ink-secondary flex items-center gap-1">
                            <MapPin className="text-[13px]" aria-hidden="true" />
                            SZX &rarr; HAM • Consignment #99318
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md text-customs-ink-primary">
                            Marcus Vance
                          </span>
                          <span className="font-caption text-caption text-customs-ink-secondary">
                            Documentation Manager
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-label-code text-label-code-sm font-medium text-customs-ink-primary">
                            2026-07-11 09:30:45 UTC
                          </span>
                          <span className="font-caption text-caption text-customs-ink-muted flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-customs-status-error-text" aria-hidden="true" />
                            Filing Gateway Pending
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-customs-status-error-bg text-customs-status-error-text font-caption text-caption max-w-[240px] text-left">
                            <X className="text-[15px] flex-shrink-0" aria-hidden="true" />
                            <span className="truncate" title="Export failed: ICEGATE schema sync timeout">
                              Export failed: ICEGATE schema sync timeout
                            </span>
                          </div>
                          <Button variant="outline" size="sm" className="px-3 py-1.5 text-body-sm text-body-md font-semibold shadow-sm" type="button">
                            <RefreshCw className="text-[16px] text-customs-ink-secondary" aria-hidden="true" />
                            <span>Retry</span>
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* ROW 5: Default State (SHP-24795) */}
                    <tr className="hover:bg-customs-surface-container-low/40 transition-colors">
                      <td className="py-4 px-6 align-middle">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-label-code text-label-code-md font-bold text-customs-ink-primary tracking-tight">
                              SHP-24795
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-customs-surface-container-high text-customs-primary font-caption text-caption font-medium">
                              <Plane className="text-[12px] mr-1" aria-hidden="true" />
                              Air Cargo
                            </span>
                          </div>
                          <span className="font-label-code text-label-code-sm text-customs-ink-secondary mt-0.5">
                            FILING ID: FL-55102-NA
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md font-medium text-customs-ink-primary">
                            EuroLogix Forwarding SA
                          </span>
                          <span className="font-body text-body-sm text-customs-ink-secondary flex items-center gap-1">
                            <MapPin className="text-[13px]" aria-hidden="true" />
                            CDG &rarr; JFK • Consignment #40321
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md text-customs-ink-primary">
                            Elena Rostova
                          </span>
                          <span className="font-caption text-caption text-customs-ink-secondary">
                            Compliance Director
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-label-code text-label-code-sm font-medium text-customs-ink-primary">
                            2026-07-10 18:22:10 UTC
                          </span>
                          <StatusBadge variant="confirmed" label="Verified Clearance" />
                        </div>
                      </td>
                      <td className="py-4 px-6 align-middle text-right">
                        <Button variant="primary" size="sm" className="flex items-center gap-1.5 px-4 py-1.5 text-body-sm text-body-md font-semibold shadow-sm" type="button">
                          <Download className="text-[18px] text-customs-primary" aria-hidden="true" />
                          <span>Export CSV</span>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination / Record Summary Footer */}
              <div className="px-6 py-2 bg-customs-surface-base flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-body text-body-sm text-customs-ink-secondary">
                  Showing <strong className="text-customs-ink-primary font-semibold">5</strong> of <strong className="text-customs-ink-primary font-semibold">5</strong> approved shipments ready for export
                </div>
                <div className="flex items-center gap-1 font-label-code text-label-code-sm">
                  <span className="px-2.5 py-1 rounded bg-customs-surface-raised shadow-sm text-customs-ink-primary font-medium">
                    Page 1 of 1
                  </span>
                  <button className="p-1 rounded bg-customs-surface-raised opacity-40 text-customs-ink-muted cursor-not-allowed" disabled type="button">
                    <ChevronLeft className="text-[18px]" aria-hidden="true" />
                  </button>
                  <button className="p-1 rounded bg-customs-surface-raised opacity-40 text-customs-ink-muted cursor-not-allowed" disabled type="button">
                    <ChevronRight className="text-[18px]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Export Schema Specification Panel */}
            <div className="bg-customs-surface-container-low p-4 rounded-xl flex items-start gap-2">
              <Database className="text-customs-primary text-[20px] mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <span className="font-headline text-headline-sm text-customs-ink-primary">
                  Export Schema Specification (EDI-ERP-832)
                </span>
                <p className="font-body text-body-sm text-customs-ink-secondary">
                  Generated CSV files adhere strictly to single-record row indexing with mandatory 8-digit HSN codes,
                  verified net/gross mass, and digital signature tokens. Mismatched quantities automatically trigger
                  pipeline hold exceptions prior to schema file synthesis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

