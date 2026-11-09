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
  Building,
  ArrowRight,
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

export default function ReviewManagerBlockedPage() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-raised/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,27,45,0.04)]">
        <div className="h-16 w-full px-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-p-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <ShieldCheck className="text-[20px]" />
              </div>
              <span className="font-headline-sm text-headline-sm text-ink-primary font-bold tracking-tight whitespace-nowrap">
                Customs Doc Check
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-1 p-1 bg-surface-container-low rounded-xl" data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg">
              <Link href="/dashboard" className="px-4 py-1.5 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg">
                Shipments
              </Link>
              <Link href="/dashboard/reports" className="px-4 py-1.5 font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                Accuracy Report
              </Link>
              <Link href="/dashboard/export" className="px-4 py-1.5 font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                Export
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-body-sm text-body-sm text-ink-primary font-medium leading-none">manager@demo.local</span>
                <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mt-1">DOCUMENTATION MANAGER</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="text-on-primary text-[18px]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          {/* Top Context Header Bar */}
          <section className="w-full bg-surface-container-lowest shadow-sm px-8 py-4">
            <div className="max-w-[1480px] mx-auto flex flex-col gap-2">
              {/* Breadcrumb & Back Link Navigation */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body-sm text-body-sm text-ink-secondary">
                  <Link href="/dashboard" className="hover:text-ink-primary transition-colors">Shipments</Link>
                  <Icon as={ChevronRight} size={16} className="text-ink-muted" aria-hidden="true" />
                  <span className="font-label-code-sm text-label-code-sm text-ink-primary font-semibold">SHP-24811</span>
                  <Icon as={ChevronRight} size={16} className="text-ink-muted" aria-hidden="true" />
                  <span className="font-body-sm text-body-sm text-ink-primary font-medium">Manager Approval</span>
                </nav>
                <Link href="/review/screen" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-base text-ink-primary hover:bg-surface-container-high transition-colors font-body-sm text-body-sm shadow-sm">
                  <ArrowLeft className="text-[16px]" />
                  <span>Back to Shipment</span>
                </Link>
              </div>
              {/* Main Identification Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="font-label-code-md text-headline-lg font-bold text-ink-primary tracking-tight">SHP-24811</h1>
                  {/* State Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-status-error-bg text-status-error-text shadow-sm">
                    <Lock className="text-[16px]" />
                    <span className="font-label-code-sm text-label-code-sm font-bold uppercase tracking-wider">Approval Blocked</span>
                  </div>
                  {/* Carrier Ref */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface">
                    <Icon as={Tag} size={16} className="text-ink-secondary" aria-hidden="true" />
                    <span className="font-label-code-sm text-label-code-sm font-medium">CARRIER REF #AX-9081</span>
                  </div>
                  {/* Mode Pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-base text-ink-primary">
                    <Icon as={Package} size={16} className="text-primary" aria-hidden="true" />
                    <span className="font-body-sm text-body-sm font-semibold">Air Cargo</span>
                  </div>
                </div>
                {/* Supplier & Timestamp Meta */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:text-right">
                  <div className="flex items-center gap-1.5">
                    <Icon as={Building} size={16} className="text-ink-muted" aria-hidden="true" />
                    <span className="font-body-sm text-body-sm font-medium text-ink-primary">Pacific Logistics Corp</span>
                  </div>
                  <span className="hidden sm:inline text-outline-variant font-label-code-sm">Ã¢â‚¬Â¢</span>
                  <div className="flex flex-col">
                    <span className="font-caption text-caption text-status-confirmed-text uppercase font-semibold flex items-center gap-1">
                      <Icon as={Lock} size={14} aria-hidden="true" />
                    </span>
                    <span className="font-label-code-sm text-label-code-sm text-ink-secondary">Approved by manager@demo.local at 2026-07-11 15:45:02 UTC</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Two Column Decision Workspace */}
          <section className="w-full px-8 py-6">
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-100 gap-6 items-start">
              {/* LEFT COLUMN: Primary Verification Artifacts */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-p-8 min-w-0">
                {/* CARD 1: Reconciled Shipment Summary */}
                <article className="bg-surface-raised rounded-xl shadow-md overflow-hidden flex flex-col">
                  {/* Card Header Bar */}
                  <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon as={CheckCircle} size={20} className="text-primary" aria-hidden="true" />
                      <h2 className="font-headline-md text-headline-md text-ink-primary font-semibold">Reconciled Shipment Summary</h2>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-confirmed-bg text-status-confirmed-text font-label-code-sm text-label-code-sm font-semibold uppercase tracking-wider shrink-0">
                      <Icon as={CheckCircle} size={14} aria-hidden="true" />
                      <span>3-WAY MATCH VALIDATED</span>
                    </div>
                  </div>
                  {/* Structured Multi-column Definition Layout */}
                  <dl className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-p-8 gap-y-p-4">
                    {/* Consignor */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-medium">Consignor / Exporter</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-headline-sm text-body-md text-ink-primary font-semibold">Pacific Logistics Corp</span>
                      <span className="font-body-sm text-body-sm text-ink-muted">Shanghai, China (CN-PVG)</span>
                    </div>
                    {/* Consignee */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-medium">Consignee &amp; GSTIN Registration</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <div className="font-headline-sm text-body-md text-ink-primary font-semibold flex items-start gap-1.5">
                        <span>Apex Logistics India Ltd</span>
                        <span className="font-label-code-sm text-label-code-sm text-primary font-normal">GSTIN: 27AAAC19241Q1</span>
                      </div>
                    </div>
                    {/* Declared Value */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Declared Total Value</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-label-code-md text-headline-sm text-ink-primary font-bold">$142,850.00 USD</span>
                      <span className="font-body-sm text-body-sm text-ink-muted">CIF Terms, Incoterms 2020</span>
                    </div>
                    {/* Port Route */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
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
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
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
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Net Weight &amp; Packaging Metric</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-label-code-md text-body-lg text-ink-primary font-bold">2,940.00 kg</span>
                      <span className="font-body-sm text-body-sm text-ink-muted">14 Pallets / 280 Cartons</span>
                    </div>
                    {/* Primary HSN */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Primary HSN Classification</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-label-code-md text-body-lg text-ink-primary font-bold">8471.30.10</span>
                      <span className="font-body-sm text-body-sm text-ink-muted">Data processing units &lt; 10kg</span>
                    </div>
                    {/* Electronic Filing ID */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Electronic Filing ID</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-label-code-sm text-label-code-md text-ink-primary font-semibold truncate">CBIC-ICEGATE-TXN-9948210</span>
                      <span className="font-caption text-caption text-ink-muted">Gateway Node Mumbai-Air cargo</span>
                    </div>
                    {/* Duty Paid / Assessed */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Duty Assessed / Debited</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-label-code-md text-headline-sm text-ink-primary font-bold">$18,637.50 USD</span>
                      <span className="font-body-sm text-body-sm text-ink-muted">Direct Debit Authorized via ECL</span>
                    </div>
                    {/* Transmission Protocol */}
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider mb-1">Transmission Protocol</span>
                        <Icon as={CheckCircle} size={16} className="text-status-confirmed-text" aria-hidden="true" />
                      </div>
                      <span className="font-label-code-sm text-label-code-md text-ink-primary font-semibold">EDIFACT 204.11</span>
                      <span className="font-caption text-caption text-status-confirmed-text font-medium">Encrypted SHA-256 Asymmetric</span>
                    </div>
                  </dl>
                  {/* Bottom Micro-footer on Card 1 */}
                  <div className="px-6 py-2.5 bg-surface-container-high/60 flex items-center justify-between text-ink-secondary">
                    <span className="font-caption text-caption flex items-center gap-1.5">
                      <Icon as={History} size={14} className="text-ink-muted" aria-hidden="true" /> Consolidated Clearance Package Manifest Rev 2.0 (Frozen)
                    </span>
                    <span className="font-label-code-sm text-caption">CRC32: 9D41F20C</span>
                  </div>
                </article>
                {/* CARD 2: Table - Changes made by the reviewer */}
                <article className="bg-surface-raised rounded-xl shadow-md overflow-hidden flex flex-col">
                  <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon as={History} size={20} className="text-primary" aria-hidden="true" />
                      <h2 className="font-headline-sm text-headline-sm text-ink-primary font-bold">Changes made by the reviewer</h2>
                    </div>
                    <span className="font-label-code-sm text-label-code-sm px-2 py-0.5 rounded-full bg-surface-base text-ink-secondary font-medium">4 Audited Reconciliations</span>
                  </div>
                  {/* Clean Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-base text-ink-secondary font-caption text-caption uppercase tracking-wider">
                          <th className="py-2 px-4 font-semibold">Field Entity</th>
                          <th className="py-2 px-4 font-semibold">OCR Extracted (Raw)</th>
                          <th className="py-2 px-4 font-semibold">Audited Value</th>
                          <th className="py-2 px-4 font-semibold">Operator Justification</th>
                          <th className="py-2 px-4 text-center font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-none font-body-sm text-body-sm text-ink-primary">
                        {/* Row 1: Gross Weight */}
                        <tr className="h-10 hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-2 px-4 font-medium text-ink-primary flex items-center gap-1.5">
                            <Icon as={Scale} size={16} className="text-ink-muted" aria-hidden="true" /> Gross Weight
                          </td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-muted line-through">3,240.00 kg</td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">3,165.00 kg</td>
                          <td className="py-2 px-4 text-ink-secondary text-caption max-w-[200px] truncate" title="Matched to Air Waybill revised cargo manifest tare weight">
                            Matched to Air Waybill manifest tare weight
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved">
                              <Icon as={CheckCircle} size={18} aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                        {/* Row 2: HSN Code classification */}
                        <tr className="h-10 hover:bg-surface-container-low/50 transition-colors bg-surface-container-low/20">
                          <td className="py-2 px-4 font-medium text-ink-primary flex items-center gap-1.5">
                            <Icon as={Tag} size={16} className="text-ink-muted" aria-hidden="true" /> HSN Code
                          </td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-muted line-through">8471.30.00</td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">8471.30.10</td>
                          <td className="py-2 px-4 text-ink-secondary text-caption max-w-[200px] truncate" title="Updated sub-item code per CBIC technical data sheet">
                            Updated sub-item per CBIC data sheet
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved">
                              <Icon as={CheckCircle} size={18} aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                        {/* Row 3: Incoterm Place */}
                        <tr className="h-10 hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-2 px-4 font-medium text-ink-primary flex items-center gap-1.5">
                            <Icon as={MapPin} size={16} className="text-ink-muted" aria-hidden="true" /> Incoterm Place
                          </td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-muted line-through">FOB Shanghai</td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">CIF Nhava Sheva</td>
                          <td className="py-2 px-4 text-ink-secondary text-caption max-w-[200px] truncate" title="Corrected per final Commercial Invoice rider #3">
                            Corrected per final Commercial Invoice rider #3
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved">
                              <Icon as={CheckCircle} size={18} aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                        {/* Row 4: Total Cartons Count */}
                        <tr className="h-10 hover:bg-surface-container-low/50 transition-colors bg-surface-container-low/20">
                          <td className="py-2 px-4 font-medium text-ink-primary flex items-center gap-1.5">
                            <Icon as={Package} size={16} className="text-ink-muted" aria-hidden="true" /> Carton Count
                          </td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-muted line-through">275 Cartons</td>
                          <td className="py-2 px-4 font-label-code-sm text-ink-primary font-bold bg-status-confirmed-bg/30">280 Cartons</td>
                          <td className="py-2 px-4 text-ink-secondary text-caption max-w-[200px] truncate" title="Reconciled with signed Packing List tally sheet">
                            Reconciled with signed Packing List tally sheet
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className="inline-flex items-center text-status-confirmed-text" title="Validated &amp; Approved">
                              <Icon as={CheckCircle} size={18} aria-hidden="true" />
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Alert Banner below reviewer table */}
                  <div className="m-4 p-4 rounded-lg bg-status-error-bg flex items-start gap-2 text-status-error-text">
                    <Icon as={AlertCircle} size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-body-md text-body-sm font-bold">Weight Cross-Check Audit Notice</span>
                      <p className="font-body-sm text-body-sm leading-relaxed">
                        Gross weight cross-check was not signed off by operator. Discrepancy exceeds the allowable 0.5% statutory threshold. Manager sign-off is restricted under customs compliance protocol 14-C.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* RIGHT COLUMN: Sticky Decision Card */}
              <aside className="lg:col-span-5 xl:col-span-4 sticky lg:top-20 flex flex-col gap-6">
                <div className="bg-surface-raised rounded-xl shadow-xl overflow-hidden flex flex-col">
                  {/* Sticky Header */}
                  <div className="px-6 py-4 bg-surface-container-low flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon as={Gavel} size={20} className="text-primary" aria-hidden="true" />
                      <h2 className="font-headline-sm text-headline-sm text-ink-primary font-bold">Manager Clearance Sign-off</h2>
                    </div>
                    <p className="font-body-sm text-body-sm text-ink-secondary mt-0.5">Authoritative dispatch &amp; customs filing sign-off</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error text-on-error font-label-code-sm text-label-code-sm font-semibold tracking-wide uppercase shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span> APPROVAL BLOCKED
                  </span>
                  <div className="p-6 flex flex-col gap-6">
                    {/* SECTION 1: Open-Issues Checklist with RED BLOCKER ROW */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-bold">Statutory Compliance Gates</span>
                        <span className="font-label-code-sm text-caption text-status-error-text font-bold">3 PASSED Ã‚Â· 1 BLOCKED</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* BLOCKER ROW (Item 1) */}
                        <div className="p-4 rounded-xl bg-status-error-bg flex flex-col gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-status-error-text text-on-error flex items-center justify-center shrink-0 mt-0.5">
                              <Icon as={X} size={16} aria-hidden="true" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="font-body-md text-body-sm font-bold text-status-error-text leading-snug">
                                Commercial Invoice vs BOL Gross Weight Mismatch
                              </div>
                              <p className="font-body-sm text-body-sm text-status-error-text/90 leading-snug">
                                Invoice states 3,120 kg, BOL states 3,165 kg (Difference: 45 kg / +1.4%). Exceeds tolerance limit (0.5%).
                              </p>
                            </div>
                          </div>
                          <div className="pl-8 pt-1">
                            <a href="#reweigh-directive" className="inline-flex items-center gap-1 font-body-sm text-body-sm font-bold text-status-error-text underline underline-offset-2 hover:opacity-80 transition-opacity">
                              <span>Return to Reviewer for Re-weigh</span>
                              <Icon as={ArrowRight} size={16} aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                        {/* Verified Item 2 */}
                        <div className="p-2 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-status-confirmed-bg text-status-confirmed-text flex items-center justify-center shrink-0 mt-0.5">
                            <Icon as={CheckCircle} size={14} aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-sm text-body-sm font-semibold text-ink-primary">Sanctions &amp; Denied Parties Screened</span>
                            <span className="font-caption text-caption text-ink-secondary">Consignee verified with Indian Customs ICEGATE registry</span>
                          </div>
                        </div>
                        {/* Verified Item 3 */}
                        <div className="p-2 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-status-confirmed-bg text-status-confirmed-text flex items-center justify-center shrink-0 mt-0.5">
                            <Icon as={CheckCircle} size={14} aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-sm text-body-sm font-semibold text-ink-primary">HS Tariff Code 8-Digit Validation</span>
                            <span className="font-caption text-caption text-ink-secondary">Tariff code matches product specifications</span>
                          </div>
                        </div>
                        {/* Verified Item 4 */}
                        <div className="p-2 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-status-confirmed-bg text-status-confirmed-text flex items-center justify-center shrink-0 mt-0.5">
                            <Icon as={CheckCircle} size={14} aria-hidden="true" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-sm text-body-sm font-semibold text-ink-primary">High-Resolution Scan Integrity (Ã¢â€°Â¥150 DPI)</span>
                            <span className="font-caption text-caption text-ink-secondary">All 3 document pages verified legible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* SECTION 2: Rejection / Reason Textarea */}
                    <div className="flex flex-col gap-1.5" id="reweigh-directive">
                      <label className="font-body-sm text-body-sm font-bold text-ink-primary flex items-center justify-between" htmlFor="reject-directive">
                        <span>Rejection Reason / Return Directive <span className="text-status-error-text">*</span></span>
                        <span className="font-caption text-caption text-ink-muted">Mandatory for Return</span>
                      </label>
                      <div className="relative">
                        <textarea className="w-full p-2 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-ink-primary outline-none focus:ring-2 focus:ring-error/20 resize-none leading-relaxed shadow-inner" id="reject-directive" rows={4}>
Weight discrepancy of 45 kg exceeds 0.5% regulatory threshold. Please upload certified scale receipt or re-confirm Packing List tare weight before resubmission.
                        </textarea>
                      </div>
                      <div className="flex items-start gap-1 text-ink-muted font-caption text-caption">
                        <Icon as={Info} size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                        <span>This reason will be logged in the shipment audit timeline and returned to the documentation operator.</span>
                      </div>
                    </div>
                    {/* SECTION 3: Dual Action Buttons & Compliance Lockout */}
                    <div className="flex flex-col gap-2 pt-2">
                      {/* Primary Action: DISABLED Grayed-out */}
                      <div className="relative group">
                        <button aria-disabled="true" className="w-full h-11 px-4 rounded-lg bg-surface-container-highest text-ink-muted font-body-md text-body-md font-semibold flex items-center justify-center gap-2 cursor-not-allowed opacity-80 shadow-none" disabled type="button">
                          <Icon as={Lock} size={18} aria-hidden="true" />
                          <span>Approve &amp; Transmit to Customs</span>
                        </button>
                        {/* Lock Reason Banner directly under disabled button */}
                        <div className="mt-2 p-2 rounded bg-surface-container flex items-center gap-2 font-caption text-caption text-ink-secondary">
                          <Icon as={Lock} size={16} className="text-ink-muted shrink-0" aria-hidden="true" />
                          <span><strong>Disabled:</strong> 1 blocking discrepancy must be resolved or waived before customs transmission.</span>
                        </div>
                      </div>
                      {/* Secondary Action: ACTIVE Prominent Return Button */}
                      <button className="w-full h-11 px-4 rounded-lg bg-error text-on-error font-body-md text-body-sm font-bold flex items-center justify-center gap-2 hover:bg-on-error-container hover:shadow-lg transition-all shadow-md active:scale-[0.99]" id="reject-action-btn" type="button">
                        <Icon as={Maximize2} size={18} aria-hidden="true" />
                        <span>Reject &amp; Return to Reviewer</span>
                      </button>
                      <div className="text-center font-caption text-caption text-ink-muted pt-1">
                        Approval transmission locked until all gating compliance checks pass.
                      </div>
                    </div>
                  </div>
                  {/* Audit Log Micro-timeline Preview */}
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <div className="font-caption text-caption text-ink-secondary uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <Icon as={UserCheck} size={16} aria-hidden="true" />
                    </div>
                    <div className="flex items-center justify-between font-label-code-sm text-label-code-sm text-ink-muted">
                      <span>TX_HASH: 0x9f1a...4811</span>
                      <span className="text-status-confirmed-text font-medium">CHAIN VERIFIED</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}



