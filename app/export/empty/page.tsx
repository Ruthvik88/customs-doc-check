"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Database,
  Fingerprint,
  HardDrive,
  List,
  Lock,
  Moon,
  RefreshCw,
  Shield,
  ShieldCheck,
  Settings,
  Sun,
  User,
  Verified,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function ExportEmptyPage() {
  return (
    <div className="bg-customs-surface font-body text-body-md text-customs-on-surface min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-customs-surface-raised/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,27,45,0.04)]">
        <div className="h-16 w-full px-margin-desktop flex items-center justify-between gap-space-lg">
          <div className="flex items-center gap-space-xl">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-customs-primary flex items-center justify-center text-customs-on-primary shadow-sm">
                <ShieldCheck className="text-[20px]" />
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
            <div className="hidden xl:flex items-center gap-space-xs px-2 py-1 rounded-full bg-customs-status-confirmed-bg text-customs-status-confirmed-text font-label-code text-label-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-customs-status-confirmed-text animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
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
              <button aria-label="Toggle dark mode" className="w-8 h-8 rounded-lg flex items-center justify-center text-customs-ink-secondary hover:text-customs-ink-primary hover:bg-customs-surface-base transition-colors" type="button">
                {typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? (
                  <Sun className="text-[20px]" aria-hidden="true" />
                ) : (
                  <Moon className="text-[20px]" aria-hidden="true" />
                )}
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
          <div className="w-full max-w-[1536px] mx-auto px-space-md lg:px-space-xl py-space-lg space-y-space-lg">
            {/* Top Action Breadcrumb & Security Status */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm text-customs-ink-secondary font-caption text-caption">
                <span className="flex items-center gap-1 hover:text-customs-ink-primary transition-colors cursor-pointer">
                  <HardDrive className="text-[14px]" aria-hidden="true" />
                  <span>Workspace</span>
                </span>
                <span className="text-customs-ink-muted">/</span>
                <span className="text-customs-ink-primary font-headline text-headline-sm text-[11px] uppercase tracking-wider">
                  Filing Operations
                </span>
                <span className="text-customs-ink-muted">/</span>
                <span className="text-customs-primary font-label-code text-label-code-sm">
                  EXP-2026-GATEWAY
                </span>
              </div>
              <div className="flex items-center gap-space-sm">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-customs-surface-container-high text-customs-on-surface-variant font-label-code text-label-code-sm">
                  <Lock className="text-[14px] text-customs-primary" aria-hidden="true" />
                  <span>ROLE: MANAGER (RESTRICTED ACCESS)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-customs-status-neutral-bg text-customs-status-neutral-text font-label-code text-label-code-sm">
                  <span className="w-2 h-2 rounded-full bg-customs-ink-muted" />
                  <span>ERP QUEUE: IDLE</span>
                </div>
              </div>
            </div>

            {/* Header Section with Strict Scope Metadata */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-customs-surface-raised p-space-lg rounded-xl shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-space-sm">
                  <h1 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight">
                    Export Shipments
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-caption bg-customs-secondary-container text-customs-on-secondary-container font-medium">
                    DIRECT SYNC
                  </span>
                </div>
                <p className="font-body text-body-md text-customs-ink-secondary">
                  Manager Only • Direct Customs ERP &amp; Filing Interface
                </p>
              </div>
              {/* Format Specification Note Container */}
              <div className="flex items-center gap-space-sm px-space-md py-2.5 bg-customs-surface-base rounded-lg text-customs-ink-secondary max-w-xl">
                <List className="text-customs-primary text-[18px] shrink-0" aria-hidden="true" />
                <p className="font-caption text-caption text-customs-ink-secondary leading-snug">
                  One row per line item, in the filing software&apos;s import layout
                </p>
              </div>
            </div>

            {/* Main Workspace Surface / Data Container */}
            <div className="w-full bg-customs-surface-raised rounded-xl shadow-sm overflow-hidden flex flex-col">
              {/* Mock Table Control Bar */}
              <div className="h-12 bg-customs-surface-base px-space-lg flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md text-customs-ink-secondary font-label-code text-label-code-sm">
                  <span className="flex items-center gap-1.5">
                    <Database className="text-[16px] text-customs-ink-muted" aria-hidden="true" />
                    <span>TARGET SCHEMA: CUSTOMS-DECL-V4.2</span>
                  </span>
                  <span className="text-customs-border-hairline">|</span>
                  <span className="flex items-center gap-1.5">
                    <List className="text-[16px] text-customs-ink-muted" aria-hidden="true" />
                    <span>DELIMITER: COMMA (, UTF-8)</span>
                  </span>
                </div>
                <div className="flex items-center gap-space-sm text-customs-ink-muted font-caption text-caption">
                  <span className="inline-block w-2 h-2 rounded-full bg-customs-ink-muted/50" />
                  <span>0 approved shipments indexed</span>
                </div>
              </div>

              {/* Empty State Main Stage */}
              <div className="relative py-20 px-space-lg flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Subtle Background Technical Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                  <span className="font-label-code text-[180px] font-bold tracking-tighter text-customs-ink-primary">
                    CSV_STAGING
                  </span>
                </div>
                {/* Centerpiece Graphic */}
                <div className="relative mb-space-lg">
                  <div className="absolute -inset-4 bg-customs-primary/5 rounded-full blur-xl pointer-events-none" />
                  <div className="relative w-24 h-24 rounded-2xl bg-customs-surface-base shadow-sm flex items-center justify-center">
                    <svg className="w-12 h-12 text-customs-ink-secondary" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M6 34L12 40H36L42 34V30H6V34Z" fill="currentColor" fill-opacity="0.12" />
                      <path d="M6 30H16L18 34H30L32 30H42" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                      <rect height="20" rx="2" stroke="currentColor" stroke-dasharray="3 3" stroke-width="2" width="20" x="14" y="8" />
                      <path d="M18 14H30" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
                      <path d="M18 19H26" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
                      <circle cx="34" cy="24" r="7" stroke="currentColor" stroke-width="2" className="fill-customs-surface-raised stroke-customs-primary" />
                      <path d="M31.5 24L33.5 26L37 22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" />
                    </svg>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-customs-status-review-bg text-customs-status-review-text flex items-center justify-center shadow-sm">
                      <Calendar className="text-[15px]" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Exact Headline Token */}
                <h2 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight max-w-md mb-2">
                  No approved shipments yet
                </h2>
                {/* Descriptive Copy */}
                <p className="font-body text-body-md text-customs-ink-secondary max-w-xl mx-auto leading-relaxed mb-space-xl">
                  Shipments must complete document verification and receive manager approval before export CSVs can
                  be generated. Once a shipment is approved, it will automatically appear here ready for filing.
                </p>
                {/* Primary Action Pipeline */}
                <div className="flex flex-col sm:flex-row items-center gap-space-sm z-10">
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-space-lg py-2.5 bg-customs-primary text-customs-on-primary font-headline text-headline-sm rounded-lg hover:bg-customs-primary-container transition-colors shadow-sm">
                    <Verified className="text-[18px]" aria-hidden="true" />
                    <span>View Pending Approvals</span>
                  </Link>
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-space-lg py-2.5 bg-customs-surface-base text-customs-ink-primary font-headline text-headline-sm rounded-lg hover:bg-customs-surface-container transition-colors">
                    <Settings className="text-[18px] text-customs-ink-secondary" aria-hidden="true" />
                    <span>Go to Shipments Dashboard</span>
                  </Link>
                </div>

                {/* Direct Customs Filing Checklist Preview Card */}
                <div className="mt-space-xl pt-space-lg w-full max-w-2xl">
                  <div className="bg-customs-surface-base/80 p-space-md rounded-xl text-left">
                    <div className="flex items-center justify-between pb-2 mb-3">
                      <span className="font-label-code text-label-code-sm text-customs-ink-primary uppercase tracking-wide flex items-center gap-1.5">
                        <Database className="text-customs-primary text-[14px]" aria-hidden="true" />
                        Direct Pipeline Prerequisites
                      </span>
                      <span className="font-caption text-caption text-customs-ink-secondary">
                        Automated Gatekeeper Rule v2.8
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm text-left">
                      <div className="p-space-sm rounded bg-customs-surface-raised flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-customs-status-confirmed-text font-caption text-caption">
                          <CheckCircle className="text-[14px]" aria-hidden="true" />
                          <span>Step 1: Doc OCR</span>
                        </div>
                        <span className="font-caption text-caption text-customs-ink-secondary">
                          Commercial Invoices, Packing Lists &amp; BOL matched
                        </span>
                      </div>
                      <div className="p-space-sm rounded bg-customs-surface-raised flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-customs-status-progress-text font-caption text-caption">
                          <RefreshCw className="text-[14px]" aria-hidden="true" />
                          <span>Step 2: Cross-Check</span>
                        </div>
                        <span className="font-caption text-caption text-customs-ink-secondary">
                          Zero tariff or gross weight discrepancies flag remaining
                        </span>
                      </div>
                      <div className="p-space-sm rounded bg-customs-surface-raised flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-customs-ink-primary font-caption text-caption">
                          <ShieldCheck className="text-customs-primary text-[14px]" aria-hidden="true" />
                          <span>Step 3: Manager Sign</span>
                        </div>
                        <span className="font-caption text-caption text-customs-ink-secondary">
                          Authorized signatory signoff moves rows here
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty State System Status Bottom Bar */}
              <div className="bg-customs-surface-base px-space-lg py-2.5 flex flex-wrap items-center justify-between gap-space-sm font-caption text-caption text-customs-ink-muted">
                <div className="flex items-center gap-space-md">
                  <span className="flex items-center gap-1">
                    <Shield className="text-[14px] text-customs-status-confirmed-text" aria-hidden="true" />
                    <span>Direct Customs Gateway: Authorized Session Active</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-label-code text-label-code-sm text-customs-ink-secondary">
                    HASH: 4F9B-9872-CUSTOMS-ERP
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="text-[14px]" aria-hidden="true" />
                  <span>Filing layout compliance strictly enforced</span>
                </div>
              </div>
            </div>

            {/* Technical Context Reference Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-customs-surface-raised p-space-md rounded-lg shadow-sm flex items-start gap-space-sm">
                <div className="p-2 rounded bg-customs-surface-base text-customs-primary shrink-0">
                  <List className="text-[20px]" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-headline text-headline-sm text-customs-ink-primary text-sm">
                    Line-Item Flat Normalization
                  </h3>
                  <p className="font-caption text-caption text-customs-ink-secondary">
                    Multi-container shipments expand automatically into atomic customs declaration line items. HS
                    Code, declared currency value, net mass, and country of origin map 1:1 into standard entry fields.
                  </p>
                </div>
              </div>
              <div className="bg-customs-surface-raised p-space-md rounded-lg shadow-sm flex items-start gap-space-sm">
                <div className="p-2 rounded bg-customs-surface-base text-customs-primary shrink-0">
                  <Fingerprint className="text-[20px]" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-headline text-headline-sm text-customs-ink-primary text-sm">
                    Audit-Grade Traceability
                  </h3>
                  <p className="font-caption text-caption text-customs-ink-secondary">
                    Every exported record carries the reviewing manager&apos;s digital credential and SHA-256 ledger stamp,
                    guaranteeing discrepancy resolution integrity prior to customs server intake.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
