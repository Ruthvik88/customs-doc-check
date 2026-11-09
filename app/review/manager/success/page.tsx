"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Package,
  Truck,
  Search,
  Edit,
  Lock,
  Settings,
  User,
  Maximize2,
  RotateCcw,
  RotateCw,
  PlusCircle,
  Download,
  CloudUpload,
  History,
  Scan,
  ZoomIn,
  AlertTriangle,
  AlertCircle,
  X,
  CheckCircle,
  ChevronDown,
  EyeOff,
  Info,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  Flag,
  Gavel,
  Inbox,
  ArrowRight,
  Building,
  Calendar,
  LayoutDashboard,
  MapPin,
  Plane,
  Scale,
  Tag,
  UserCheck,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewManagerSuccessPage() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface">
      {/* Interactive Toast Notification */}
      <div className="fixed bottom-6 right-8 z-50 flex items-center gap-space-md px-space-lg py-3 rounded-xl bg-ink-primary text-surface-container-lowest shadow-xl border-0 transition-all duration-500 translate-y-0 opacity-100" id="toast-receipt">
        <div className="w-7 h-7 rounded-full bg-status-confirmed-bg text-status-confirmed-text flex items-center justify-center">
          <CheckCircle className="text-[18px]" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-body-sm font-semibold text-surface-container-lowest">ICEGATE ACK-200 Confirmed</span>
          <span className="font-caption text-caption text-ink-muted">Transaction ID: ICEGATE-TXN-9948210</span>
        </div>
        <button className="ml-space-md text-ink-muted hover:text-surface-container-lowest" onClick={() => document.getElementById("toast-receipt")?.classList.add("translate-y-12", "opacity-0")}>
          <X className="text-[16px]" />
        </button>
      </div>

      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          {/* Context Header & Monospace Metadata Anchor */}
          <div className="w-full max-w-[1440px] mx-auto px-margin-desktop py-space-xl flex flex-col gap-space-xl">
            {/* Breadcrumb & Quick Jump */}
            <div className="flex items-center justify-between gap-space-md flex-wrap">
              <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-body-sm text-body-sm text-ink-secondary">
                <Link href="/dashboard" className="hover:text-ink-primary transition-colors">Shipments</Link>
                <Icon as={ChevronRight} size={14} className="text-outline-variant" aria-hidden="true" />
                <span className="font-label-code-sm text-label-code-sm text-ink-primary font-semibold">SHP-24811</span>
                <Icon as={ChevronRight} size={14} className="text-outline-variant" aria-hidden="true" />
                <span className="font-body-sm text-body-sm text-ink-primary font-medium">Manager Approval</span>
              </nav>
              <Link href="/review/screen" className="inline-flex items-center gap-1.5 text-primary hover:text-on-primary-fixed-variant font-headline-sm text-body-sm font-medium transition-colors">
                <ArrowLeft className="text-[18px]" />
                <span>Back to Shipments Dashboard</span>
              </Link>
            </div>
            {/* Main Operational Identity Block */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg mt-space-xs">
              <div className="flex flex-wrap items-center gap-space-md">
                <h1 className="font-label-code-md text-headline-xl text-ink-primary font-bold tracking-tight">SHP-24811</h1>
                {/* Success Status Badge with micro-beacon */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-confirmed-bg text-status-confirmed-text shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-status-confirmed-text"></span>
                  <span className="font-label-code-sm text-label-code-sm font-bold tracking-wide uppercase">Approved &amp; Transmitted</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-ink-secondary">
                  <span className="font-caption text-caption text-ink-muted uppercase">CARRIER REF</span>
                  <span className="font-label-code-sm text-label-code-sm text-ink-primary font-semibold">#AX-9081</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-status-progress-bg text-status-progress-text">
                  <Icon as={ArrowRight} size={16} aria-hidden="true" />
                  <span className="font-body-sm text-body-sm font-semibold">Air Cargo</span>
                </div>
              </div>
              {/* Supplier & Auditor Timestamp Stamp */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg lg:text-right">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-ink-secondary uppercase">Primary Supplier</span>
                  <span className="font-headline-sm text-body-sm text-ink-primary font-semibold">Pacific Logistics Corp</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-surface-container-high"></div>
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-status-confirmed-text uppercase font-semibold flex items-center gap-1">
                    <Icon as={Lock} size={14} aria-hidden="true" />
                  </span>
                  <span className="font-label-code-sm text-label-code-sm text-ink-secondary">Approved by manager@demo.local at 2026-07-11 15:45:02 UTC</span>
                </div>
              </div>
            </div>
          </div>
          {/* Asymmetrical Layout: 62% Left Reconciled Data & Permanent Ledger | 38% Right Sticky Success Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 flex flex-col gap-space-xl">
              {/* CARD 1: Reconciled Shipment Summary Card */}
              <article className="bg-surface-raised rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Green Verified Digital Sign Banner */}
                <div className="px-space-lg py-3.5 bg-status-confirmed-bg text-status-confirmed-text flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <Icon as={UserCheck} size={20} className="text-primary" aria-hidden="true" />
                    <span className="font-headline-sm text-body-sm font-bold truncate">
                      Official Customs Filing Package #INNSA-2026-088192-A Generated &amp; Digitally Signed
                    </span>
                  </div>
                  <span className="font-label-code-sm text-caption px-2 py-0.5 rounded bg-surface-raised text-status-confirmed-text font-semibold uppercase tracking-wider shrink-0">EDIFACT 204.11</span>
                </div>
                {/* Definition Grid: Strict 2-column tabular locked fields */}
                <div className="p-space-lg grid grid-cols-1 sm:grid-cols-2 gap-x-space-xl gap-y-space-md bg-surface-raised">
                  {/* Consignor */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-medium">Consignor / Exporter</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-headline-sm text-body-sm text-ink-primary font-semibold">Pacific Logistics Corp</span>
                    <span className="font-body-sm text-body-sm text-ink-muted">Shanghai, China (CN-PVG)</span>
                  </div>
                  {/* Consignee */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-medium">Consignee &amp; GSTIN Registration</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <div className="font-headline-sm text-body-md text-ink-primary font-semibold flex items-start gap-1.5">
                      <span>Apex Logistics India Ltd</span>
                      <span className="font-label-code-sm text-label-code-sm text-primary font-normal">GSTIN: 27AAAC19241Q1</span>
                    </div>
                  </div>
                  {/* Total Value */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Declared Total Value</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-md text-headline-sm text-ink-primary font-bold">$142,850.00 USD</span>
                    <span className="font-body-sm text-body-sm text-ink-muted">CIF Terms, Incoterms 2020</span>
                  </div>
                  {/* Port Route */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-medium">Port Route Corridor</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2 font-headline-sm text-body-md text-ink-primary font-semibold">
                      <span className="font-label-code-sm text-label-code-sm font-bold bg-surface-container px-2 py-0.5 rounded">PVG</span>
                      <Icon as={ArrowRight} size={16} className="text-ink-muted" aria-hidden="true" />
                      <span className="font-label-code-sm text-label-code-sm font-bold bg-surface-container px-2 py-0.5 rounded">INNSA</span>
                      <span className="font-body-sm text-body-sm text-ink-muted">Transit: Ocean &amp; Air Multi-Modal</span>
                    </div>
                  </div>
                  {/* Gross Weight */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Gross Weight</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-md text-body-lg text-ink-primary font-bold">3,165.00 kg</span>
                    <span className="font-body-sm text-body-sm text-status-confirmed-text font-medium flex items-center gap-1">
                      <Icon as={CheckCircle} size={14} aria-hidden="true" />
                    </span>
                  </div>
                  {/* Net Weight */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Net Weight &amp; Packaging Metric</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-md text-body-lg text-ink-primary font-bold">2,940.00 kg</span>
                    <span className="font-body-sm text-body-sm text-ink-muted">14 Pallets / 280 Cartons</span>
                  </div>
                  {/* Primary HSN */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Primary HSN Classification</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-md text-body-lg text-ink-primary font-bold">8471.30.10</span>
                    <span className="font-body-sm text-body-sm text-ink-muted">Data processing units &lt; 10kg</span>
                  </div>
                  {/* Electronic Filing ID */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Electronic Filing ID</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-sm text-label-code-md text-ink-primary font-semibold truncate">CBIC-ICEGATE-TXN-9948210</span>
                    <span className="font-caption text-caption text-ink-muted">Gateway Node Mumbai-Air cargo</span>
                  </div>
                  {/* Duty Paid / Assessed */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Duty Assessed / Debited</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-md text-headline-sm text-ink-primary font-bold">$18,637.50 USD</span>
                    <span className="font-body-sm text-body-sm text-ink-muted">Direct Debit Authorized via ECL</span>
                  </div>
                  {/* Transmission Protocol */}
                  <div className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Transmission Protocol</span>
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                    </div>
                    <span className="font-label-code-sm text-label-code-md text-ink-primary font-semibold">EDIFACT 204.11</span>
                    <span className="font-caption text-caption text-status-confirmed-text font-medium">Encrypted SHA-256 Asymmetric</span>
                  </div>
                </div>
                {/* Bottom Micro-footer on Card 1 */}
                <div className="px-space-lg py-2.5 bg-surface-container-high/60 flex items-center justify-between text-ink-secondary">
                  <span className="font-caption text-caption flex items-center gap-1.5">
                    <Icon as={History} size={14} className="text-ink-muted" aria-hidden="true" />
                  </span>
                  <span className="font-label-code-sm text-caption">CRC32: 9D41F20C</span>
                </div>
              </article>
              {/* CARD 2: Permanent Audited Reviewer Changes Ledger */}
              <article className="bg-surface-raised rounded-xl shadow-md overflow-hidden flex flex-col">
                <div className="px-space-lg py-4 bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <Icon as={CheckCircle} size={20} className="text-primary" aria-hidden="true" />
                    <h2 className="font-headline-sm text-headline-sm text-ink-primary font-bold">Changes made by the reviewer</h2>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-status-confirmed-bg text-status-confirmed-text font-label-code-sm text-label-code-sm font-bold uppercase tracking-wider shrink-0">
                    <Icon as={Lock} size={14} aria-hidden="true" />
                  </div>
                </div>
                {/* Frozen Table of 4 Audited Edits */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container-low/70 text-ink-secondary font-caption text-caption uppercase tracking-wider h-8">
                        <th className="py-2 px-space-md font-semibold">Field Entity</th>
                        <th className="py-2 px-space-md font-semibold">OCR Extracted (Raw)</th>
                        <th className="py-2 px-space-md font-semibold">Audited Value</th>
                        <th className="py-2 px-space-md font-semibold">Operator Justification</th>
                        <th className="py-2 px-space-md text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-none font-body-sm text-body-sm text-ink-primary">
                      {/* Row 1: Gross Weight */}
                      <tr className="h-10 hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-2 px-space-md font-medium text-ink-primary flex items-center gap-1.5">
                          <Icon as={Scale} size={16} className="text-ink-muted" aria-hidden="true" />
                        </td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-muted line-through">3,240.00 kg</td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">3,165.00 kg</td>
                        <td className="py-2 px-space-md text-ink-secondary text-caption max-w-[200px] truncate" title="Matched to Air Waybill revised cargo manifest tare weight">Matched to Air Waybill manifest tare weight</td>
                        <td className="py-2 px-space-md text-center">
                          <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved"><Icon as={CheckCircle} size={18} aria-hidden="true" /></span>
                        </td>
                      </tr>
                      {/* Row 2: HSN Code classification */}
                      <tr className="h-10 hover:bg-surface-container-low/50 transition-colors bg-surface-container-low/20">
                        <td className="py-2 px-space-md font-medium text-ink-primary flex items-center gap-1.5">
                          <Icon as={Tag} size={16} className="text-ink-muted" aria-hidden="true" /> HSN Code
                        </td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-muted line-through">8471.30.00</td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">8471.30.10</td>
                        <td className="py-2 px-space-md text-ink-secondary text-caption max-w-[200px] truncate" title="Updated sub-item code per CBIC technical data sheet">Updated sub-item per CBIC data sheet</td>
                        <td className="py-2 px-space-md text-center">
                          <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved"><Icon as={CheckCircle} size={18} aria-hidden="true" /></span>
                        </td>
                      </tr>
                      {/* Row 3: Incoterm Place */}
                      <tr className="h-10 hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-2 px-space-md font-medium text-ink-primary flex items-center gap-1.5">
                          <Icon as={MapPin} size={16} className="text-ink-muted" aria-hidden="true" /> Incoterm Place
                        </td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-muted line-through">FOB Shanghai</td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">CIF Nhava Sheva</td>
                        <td className="py-2 px-space-md text-ink-secondary text-caption max-w-[200px] truncate" title="Corrected per final Commercial Invoice rider #3">Corrected per final Commercial Invoice rider #3</td>
                        <td className="py-2 px-space-md text-center">
                          <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved"><Icon as={CheckCircle} size={18} aria-hidden="true" /></span>
                        </td>
                      </tr>
                      {/* Row 4: Total Cartons Count */}
                      <tr className="h-10 hover:bg-surface-container-low/50 transition-colors bg-surface-container-low/20">
                        <td className="py-2 px-space-md font-medium text-ink-primary flex items-center gap-1.5">
                          <Icon as={Package} size={16} className="text-ink-muted" aria-hidden="true" /> Carton Count
                        </td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-muted line-through">275 Cartons</td>
                        <td className="py-2 px-space-md font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">280 Cartons</td>
                        <td className="py-2 px-space-md text-ink-secondary text-caption max-w-[200px] truncate" title="Reconciled with signed Packing List tally sheet">Reconciled with signed Packing List tally sheet</td>
                        <td className="py-2 px-space-md text-center">
                          <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved"><Icon as={CheckCircle} size={18} aria-hidden="true" /></span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Manager Approval Sign-Off Note Box */}
                <div className="m-space-md p-space-md rounded-lg bg-surface-container-low flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-ink-secondary uppercase font-semibold flex items-center gap-1.5">
                      <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" /> Executive Sign-off Annotation
                    </span>
                    <span className="font-label-code-sm text-caption text-ink-muted">2026-07-11 15:45:02 UTC</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-primary leading-relaxed bg-surface-raised p-space-sm rounded shadow-none">
                    <span className="font-semibold text-ink-primary">Manager Note:</span> &quot;Reconciliation verified against verified Bill of Lading. Gross weight variance resolved by documentation operator with verified packing list note.&quot;
                  </p>
                  <div className="flex items-center justify-between text-caption text-ink-secondary mt-1">
                    <span>Signatory: <strong className="text-ink-primary font-medium">manager@demo.local</strong></span>
                    <span className="font-label-code-sm text-caption text-status-confirmed-text font-semibold">ECDSA P-256 Validated</span>
                  </div>
                </div>
              </article>
            </div>
            {/* RIGHT COLUMN: Sticky Success Card */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg lg:sticky lg:top-20">
              {/* CELEBRATORY & OPERATIONAL SUCCESS CARD */}
              <div className="bg-surface-raised rounded-xl shadow-md overflow-hidden flex flex-col">
                {/* Emerald Card Accent Header Top */}
                <div className="h-2 w-full bg-status-confirmed-text"></div>
                <div className="p-space-lg flex flex-col items-center text-center">
                  {/* Large Emerald Success Emblem / Animated Check Ring */}
                  <div className="relative w-20 h-20 rounded-full bg-status-confirmed-bg text-status-confirmed-text flex items-center justify-center mb-space-md shadow-sm">
                    <span className="absolute inset-0 rounded-full border-2 border-status-confirmed-text/30 animate-ping opacity-25"></span>
                    <Icon as={CheckCircle} size={48} style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true" />
                  </div>
                  {/* Heading & Subtext */}
                  <h2 className="font-headline-lg text-headline-lg text-ink-primary font-bold tracking-tight mb-2">Customs Clearance Package Transmitted</h2>
                  <p className="font-body-md text-body-md text-ink-secondary mb-space-lg max-w-sm">
                    Shipment <span className="font-label-code-sm font-semibold text-ink-primary">SHP-24811</span> has been successfully signed, cryptographically hashed, and transmitted to Nhava Sheva Customs (ICEGATE node 204.11).
                  </p>
                  {/* Clearance Receipt Details Box */}
                  <div className="w-full rounded-xl bg-surface-container-low p-space-md flex flex-col gap-2.5 text-left mb-space-lg">
                    <div className="flex items-center justify-between py-1">
                      <span className="font-caption text-caption text-ink-secondary uppercase">Customs Filing Reference</span>
                      <span className="font-label-code-md text-label-code-md font-bold text-ink-primary">INNSA-CBIC-2026-90281</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-caption text-caption text-ink-secondary uppercase">Electronic Signature Hash</span>
                      <span className="font-label-code-sm text-caption text-ink-secondary truncate max-w-[190px]" title="sha256:4f8a9e88d19a2b8510f2791ccda4320b29c81b">sha256:4f8a9e...29c81b</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-caption text-caption text-ink-secondary uppercase">Filing Timestamp</span>
                      <span className="font-label-code-sm text-caption text-ink-primary font-semibold">2026-07-11 15:45:02 UTC</span>
                    </div>
                    <div className="flex items-center justify-between py-1 pt-2">
                      <span className="font-caption text-caption text-ink-secondary uppercase">Transmission Status</span>
                      <span className="font-body-sm text-body-sm font-semibold text-status-confirmed-text flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-status-confirmed-text"></span> EDI Confirmed (ACK-200)
                      </span>
                    </div>
                  </div>
                  {/* Verification Checklist */}
                  <div className="w-full flex flex-col gap-2.5 mb-space-lg text-left">
                    <div className="flex items-center justify-between py-1.5 px-space-sm rounded-lg bg-status-confirmed-bg/50">
                      <div className="flex items-center gap-2">
                        <Icon as={CheckCircle} size={18} className="text-status-confirmed-text" aria-hidden="true" />
                        <span className="font-body-sm text-body-sm font-medium text-ink-primary">Commercial Invoice &amp; PL Reconciled</span>
                      </div>
                      <span className="font-label-code-sm text-caption text-status-confirmed-text font-semibold">15:44:10</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 px-space-sm rounded-lg bg-status-confirmed-bg/50">
                      <div className="flex items-center gap-2">
                        <Icon as={CheckCircle} size={18} className="text-status-confirmed-text" aria-hidden="true" />
                        <span className="font-body-sm text-body-sm font-medium text-ink-primary">Sanctions &amp; Denied Parties Screened</span>
                      </div>
                      <span className="font-label-code-sm text-caption text-status-confirmed-text font-semibold">15:44:38</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 px-space-sm rounded-lg bg-status-confirmed-bg/50">
                      <div className="flex items-center gap-2">
                        <Icon as={CheckCircle} size={18} className="text-status-confirmed-text" aria-hidden="true" />
                        <span className="font-body-sm text-body-sm font-medium text-ink-primary">E-Sign Token Hardware Authenticated</span>
                      </div>
                      <span className="font-label-code-sm text-caption text-status-confirmed-text font-semibold">15:45:00</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 px-space-sm rounded-lg bg-status-confirmed-bg/50">
                      <div className="flex items-center gap-2">
                        <Icon as={CheckCircle} size={18} className="text-status-confirmed-text" aria-hidden="true" />
                        <span className="font-body-sm text-body-sm font-medium text-ink-primary">Direct ICEGATE EDI Gateway Transmission</span>
                      </div>
                      <span className="font-label-code-sm text-caption text-status-confirmed-text font-semibold">15:45:02</span>
                    </div>
                  </div>
                  {/* Action Buttons Suite */}
                  <div className="w-full flex flex-col gap-space-sm">
                    <a className="w-full h-11 px-space-md rounded-lg bg-status-confirmed-text text-surface-container-lowest font-headline-sm text-body-md font-semibold inline-flex items-center justify-center gap-2 hover:opacity-95 shadow-sm transition-all active:scale-[0.99]" href="#">
                      <Icon as={Download} size={20} aria-hidden="true" />
                      <span>Download Official Customs Declaration (PDF)</span>
                    </a>
                    <a className="w-full h-9 px-space-md rounded-lg bg-surface-container-low text-ink-primary font-headline-sm text-body-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-surface-container transition-colors" href="#" target="_blank">
                      <Icon as={Maximize2} size={18} className="text-primary" aria-hidden="true" />
                      <span>View in ICEGATE Live Tracker</span>
                    </a>
                    <a className="w-full h-9 px-space-md rounded-lg bg-transparent text-ink-secondary hover:text-ink-primary font-body-sm text-body-sm font-medium inline-flex items-center justify-center gap-1.5 transition-colors" href="#">
                      <Icon as={LayoutDashboard} size={18} aria-hidden="true" />
                      <span>Return to Shipments Dashboard</span>
                    </a>
                  </div>
                  {/* ISO Compliance Regulatory Seal Box */}
                  <div className="p-space-md bg-surface-container-low text-center">
                    <p className="font-caption text-caption text-ink-muted leading-tight">
                      Encrypted ledger receipt generated and archived under <span className="font-semibold text-ink-secondary">ISO/IEC 27001</span> regulatory standards.
                    </p>
                  </div>
                </div>
                {/* Supplemental Secondary Card: Audit Trail Hash Signature */}
                <div className="p-space-md rounded-xl bg-surface-raised shadow-sm flex items-start gap-space-sm text-ink-secondary">
                  <Icon as={UserCheck} size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-headline-sm text-body-sm font-semibold text-ink-primary">Cryptographic Audit Enclave Active</span>
                    <p className="font-caption text-caption text-ink-secondary">
                      All modifications and transmission packets are permanently mirrored to the WCO Safe Framework audit node. Local copies locked against changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
