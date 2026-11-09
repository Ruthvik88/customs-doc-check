"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function ExportLoadingPage() {
  return (
    <div className="bg-customs-surface font-body text-body-md text-customs-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-customs-surface-raised/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,27,45,0.04)]">
        <div className="h-16 w-full px-margin-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-xl">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-customs-primary flex items-center justify-center text-customs-on-primary shadow-sm">
                <Icon as={ShieldCheck} size={20} aria-hidden="true" />
              </div>
              <span className="font-headline text-headline-sm text-customs-ink-primary tracking-tight whitespace-nowrap">
                Customs Doc Check
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-space-xs p-space-xs bg-customs-surface-container-low rounded-full" data-active-classes="bg-customs-primary text-customs-on-primary-container font-headline-sm rounded-lg">
              <Link href="/dashboard" className="px-space-md py-1.5 transition-colors font-headline-sm text-headline-sm text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-low/50 rounded-full">
                Shipments
              </Link>
              <Link href="/reports" className="px-space-md py-1.5 font-headline-sm text-headline-sm text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-low/50 rounded-full">
                Accuracy Report
              </Link>
              <Link href="/export" className="px-space-md py-1.5 transition-colors bg-customs-primary text-customs-on-primary-container font-headline-sm rounded-full" aria-current="page">
                Export
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm pl-space-sm border-l border-customs-border-hairline">
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
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 flex-1 bg-customs-surface">
        <div className="flex flex-col w-full">
          <div className="px-space-md lg:px-space-xl py-space-lg max-w-[1560px] mx-auto w-full flex flex-col gap-space-lg">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="font-label-code text-label-code-sm uppercase tracking-wider text-customs-primary">
                    Compliance Clearance Hub
                  </span>
                  <span className="w-1 h-1 rounded-full bg-customs-ink-muted" />
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
            </div>

            {/* Loading Telemetry Notification Bar */}
            <div className="relative overflow-hidden rounded-xl bg-customs-status-progress-bg px-space-lg py-3.5 shadow-sm">
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-customs-surface-raised flex items-center justify-center text-customs-status-progress-text shadow-sm flex-shrink-0">
                    <Icon as={RefreshCw} size={16} className="animate-spin" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-body text-body-md font-semibold text-customs-ink-primary">
                      Loading approved shipments…
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skeleton Table Container */}
            <div className="rounded-xl bg-customs-surface-raised shadow-md overflow-hidden flex flex-col">
              {/* Table Top Toolbar Skeleton */}
              <div className="p-space-md bg-customs-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm w-full sm:w-80">
                  <div className="relative w-full h-9 bg-customs-surface-base rounded-lg overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_8s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                  </div>
                </div>
                <div className="flex items-center gap-space-sm">
                  <div className="w-28 h-9 bg-customs-surface-base rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_8s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                  </div>
                  <div className="w-24 h-9 bg-customs-surface-base rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_8s_infinite] bg-gradient-to-r from-transparent via-customs-surface-container-high/60 to-transparent" />
                  </div>
                </div>
              </div>

              {/* Structural Table Area */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[860px]">
                  <thead>
                    <tr className="h-10 bg-customs-surface-base text-customs-ink-secondary">
                      <th className="px-space-lg w-[26%]" scope="col">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-20 bg-customs-surface-dim rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                          </div>
                          <span className="font-caption text-caption text-customs-ink-secondary uppercase tracking-wider font-semibold">
                            SHIPMENT
                          </span>
                        </div>
                      </th>
                      <th className="px-space-md w-[28%]" scope="col">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-16 bg-customs-surface-dim rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                          </div>
                          <span className="font-caption text-caption text-customs-ink-secondary uppercase tracking-wider font-semibold">
                            SUPPLIER
                          </span>
                        </div>
                      </th>
                      <th className="px-space-md w-[18%]" scope="col">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-20 bg-customs-surface-dim rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                          </div>
                          <span className="font-caption text-caption text-customs-ink-secondary uppercase tracking-wider font-semibold">
                            APPROVED BY
                          </span>
                        </div>
                      </th>
                      <th className="px-space-md w-[16%]" scope="col">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-20 bg-customs-surface-dim rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                          </div>
                          <span className="font-caption text-caption text-customs-ink-secondary uppercase tracking-wider font-semibold">
                            APPROVED ON
                          </span>
                        </div>
                      </th>
                      <th className="px-space-lg w-[12%] text-right" scope="col">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-caption text-caption text-customs-ink-secondary uppercase tracking-wider font-semibold">
                            EXPORT
                          </span>
                          <div className="h-3 w-10 bg-customs-surface-dim rounded relative overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_5s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-customs-surface-raised divide-none">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="h-16 hover:bg-customs-surface-container-low/40 transition-colors {i % 2 === 0 ? 'bg-customs-surface-container-low/20' : ''}">
                        <td className="px-space-lg py-space-sm">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`h-4 w-32 bg-customs-surface-dim rounded font-label-code-md relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                              <div className={`h-4 w-${i % 2 === 0 ? '10' : '12'} bg-customs-status-confirmed-bg/60 rounded-full relative overflow-hidden`}>
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                              </div>
                            </div>
                            <div className={`h-3 w-${i % 2 === 0 ? '36' : '44'} bg-customs-surface-base rounded relative overflow-hidden`}>
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                          </div>
                        </td>
                        <td className="px-space-md py-space-sm">
                          <div className="flex flex-col gap-1">
                            <div className={`h-4 w-${i % 2 === 0 ? '40' : '48'} bg-customs-surface-dim rounded relative overflow-hidden`}>
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                            <div className={`h-3 w-${i % 2 === 0 ? '24' : '28'} bg-customs-surface-base rounded relative overflow-hidden`}>
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                          </div>
                        </td>
                        <td className="px-space-md py-space-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-customs-surface-dim relative overflow-hidden flex-shrink-0">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                            <div className={`h-3.5 w-${i % 2 === 0 ? '24' : '28'} bg-customs-surface-dim rounded relative overflow-hidden`}>
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                          </div>
                        </td>
                        <td className="px-space-md py-space-sm">
                          <div className="flex flex-col gap-1">
                            <div className={`h-3.5 w-${i % 2 === 0 ? '24' : '28'} bg-customs-surface-dim rounded font-label-code-sm relative overflow-hidden`}>
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                            <div className={`h-3 w-${i % 2 === 0 ? '16' : '20'} bg-customs-surface-base rounded relative overflow-hidden`}>
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1_6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                            </div>
                          </div>
                        </td>
                        <td className="px-space-lg py-space-sm text-right">
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

              {/* Table Footer / Pagination Skeleton Placeholder */}
              <div className="px-space-lg py-space-md bg-customs-surface-raised flex items-center justify-between">
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
          </div>
        </div>
      </main>
    </div>
  );
}
