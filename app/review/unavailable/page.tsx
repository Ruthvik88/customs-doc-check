"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  FolderOpen,
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
  Upload,
  History,
  Scan,
  ZoomIn,
  AlertTriangle,
  AlertCircle,
  X,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Info,
  Minus,
  Plus,
  RefreshCw,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewUnavailablePage() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Header */}

      <main className="w-full pt-14 bg-surface min-h-[calc(100vh-3rem)]">
        <div className="flex flex-col w-full">
          {/* Operational breadcrumb & context bar */}
          <div className="w-full bg-surface-raised px-4 lg:px-8 py-2 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-ink-primary font-label-code-sm text-label-code-sm">
                <FolderOpen className="text-[14px] text-primary" />
                <span>CONSIGNMENT #SHP-24811</span>
              </span>
              <span className="text-outline-variant font-caption text-caption">/</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-base font-body-sm text-body-sm text-ink-secondary">
                <span>Vessel: MSC OSCAR · Voyage 24E</span>
              </span>
              <span className="text-outline-variant font-caption text-caption">/</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-status-error-bg text-status-error-text font-label-code-sm text-label-code-sm font-semibold">
                <AlertTriangle className="w-2 h-2 rounded-full bg-status-error-text animate-ping" />
                <span>PAGE-FAULT: OCR UNREADABLE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-caption text-caption uppercase text-ink-muted tracking-wider">Doc Confidence</span>
                <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="bg-status-error-text h-full w-[38%] rounded-full" />
                </div>
                <span className="font-label-code-sm text-label-code-sm font-semibold text-status-error-text">38.4%</span>
              </div>
              <span className="h-4 w-px bg-surface-container"></span>
              <Button type="button" size="sm" variant="outline" className="px-2.5 py-1 rounded bg-surface-container text-ink-primary hover:bg-surface-container-high font-body-sm text-body-sm inline-flex items-center gap-1 transition-colors">
                <History className="text-[16px]" />
                <span>View Audit Trail</span>
              </Button>
            </div>
          </div>

          {/* Primary asymmetric 55/45 split view */}
          <div className="w-full px-4 lg:px-8 py-4">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start min-h-[calc(100vh-12rem)]">
              {/* LEFT SIDE (55% on XL): Document Viewer Canvas with Unreadable Alert Overlay */}
              <section className="xl:col-span-7 flex flex-col bg-surface-raised rounded-xl shadow-md overflow-hidden relative">
                {/* Document Toolbar & Tabs */}
                <div className="px-4 py-2 bg-surface-base flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3 py-1.5 rounded-lg bg-surface-raised shadow-sm font-headline-sm text-headline-sm flex items-center gap-2 no-underline active:border-transparent"
                    >
                      <FileText className="text-[16px] text-primary" />
                      <span>Commercial Invoice</span>
                      <span className="px-1 py-0.2 rounded-full bg-status-error-bg text-status-error-text font-label-code-sm text-label-code-sm font-bold">!</span>
                    </Button>
                    <Button variant="outline" size="sm" className="px-3.5 py-1.5 rounded-lg font-label-code-sm text-label-code-sm text-ink-muted hover:text-ink-primary flex items-center gap-2 transition-colors no-underline">
                      <Package className="text-[16px]" />
                      <span>Packing List</span>
                    </Button>
                    <Button variant="outline" size="sm" className="px-3.5 py-1.5 rounded-lg font-label-code-sm text-label-code-sm text-ink-muted hover:text-ink-primary flex items-center gap-2 transition-colors no-underline">
                      <Truck className="text-[16px]" />
                      <span>Bill of Lading</span>
                    </Button>
                  </div>
                  {/* Page Navigator & Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 bg-surface-raised rounded-lg px-2 py-1 shadow-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container text-ink-secondary" title="Previous page" aria-label="Previous page"
                      >
                        <ChevronLeft className="text-[18px]" />
                      </Button>
                      <div className="px-2 font-label-code-md text-label-code-md font-semibold text-ink-primary">
                        Page <span className="text-status-error-text">2</span> of 3
                      </div>
                      <Button variant="outline" size="sm" className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container text-ink-secondary" title="Next page" aria-label="Next page">
                        <ChevronRight className="text-[18px]" />
                      </Button>
                    </div>
                    <div className="hidden sm:inline-flex items-center gap-1 bg-surface-raised rounded-lg px-2 py-1 shadow-sm">
                      <Button variant="outline" size="sm" className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container text-ink-secondary" title="Zoom Out" aria-label="Zoom out">
                        <Minus className="text-[16px]" />
                      </Button>
                      <span className="font-label-code-sm text-label-code-sm px-1 text-ink-secondary">100%</span>
                      <Button variant="outline" size="sm" className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container text-ink-secondary" title="Zoom In" aria-label="Zoom in">
                        <Plus className="text-[16px]" />
                      </Button>
                      <Button variant="outline" size="sm" className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container text-ink-secondary ml-1" title="Rotate" aria-label="Rotate counterclockwise">
                        <RotateCcw className="text-[16px]" />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Document Viewport with Degraded Underlay & Prominent Error Dialog Overlay */}
                <div className="relative w-full min-h-[680px] bg-surface-container-high/40 flex items-center justify-center p-4 lg:p-6 overflow-hidden">
                  {/* Background: Heavily blurred, skewed, simulated degraded invoice scan */}
                  <div className="absolute inset-4 lg:inset-8 bg-surface-raised shadow-xl rounded-lg p-8 select-none filter blur-[3.5px] opacity-40 rotate-[1.8deg] pointer-events-none transform scale-95 overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-2">
                        <div className="w-48 h-6 bg-ink-primary/80 rounded" />
                        <div className="w-32 h-4 bg-ink-secondary/60 rounded" />
                        <div className="w-40 h-3 bg-ink-muted/50 rounded" />
                      </div>
                      <div className="w-32 h-12 bg-ink-primary/20 rounded" />
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <div className="h-10 bg-surface-container rounded" />
                      <div className="h-10 bg-surface-container rounded" />
                      <div className="h-10 bg-surface-container rounded" />
                      <div className="h-10 bg-surface-container rounded" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-8 bg-surface-container-highest/80 rounded w-full flex items-center px-4 gap-4">
                        <div className="w-12 h-3 bg-ink-muted/60 rounded" />
                        <div className="w-48 h-3 bg-ink-muted/60 rounded" />
                        <div className="w-20 h-3 bg-ink-muted/60 rounded" />
                        <div className="w-16 h-3 bg-ink-muted/60 rounded ml-auto" />
                      </div>
                      <div className="h-8 bg-surface-container-highest/60 rounded w-full flex items-center px-4 gap-4">
                        <div className="w-12 h-3 bg-ink-muted/40 rounded" />
                        <div className="w-56 h-3 bg-ink-muted/40 rounded" />
                        <div className="w-20 h-3 bg-ink-muted/40 rounded" />
                        <div className="w-16 h-3 bg-ink-muted/40 rounded ml-auto" />
                      </div>
                      <div className="h-8 bg-surface-container-highest/70 rounded w-full flex items-center px-4 gap-4">
                        <div className="w-12 h-3 bg-ink-muted/50 rounded" />
                        <div className="w-40 h-3 bg-ink-muted/50 rounded" />
                        <div className="w-20 h-3 bg-ink-muted/50 rounded" />
                        <div className="w-16 h-3 bg-ink-muted/50 rounded ml-auto" />
                      </div>
                      <div className="h-8 bg-surface-container-highest/90 rounded w-full flex items-center px-4 gap-4">
                        <div className="w-12 h-3 bg-ink-muted/70 rounded" />
                        <div className="w-64 h-3 bg-ink-muted/70 rounded" />
                        <div className="w-20 h-3 bg-ink-muted/70 rounded" />
                        <div className="w-16 h-3 bg-ink-muted/70 rounded ml-auto" />
                      </div>
                      <div className="h-8 bg-surface-container-highest/60 rounded w-full flex items-center px-4 gap-4">
                        <div className="w-12 h-3 bg-ink-muted/40 rounded" />
                        <div className="w-44 h-3 bg-ink-muted/40 rounded" />
                        <div className="w-20 h-3 bg-ink-muted/40 rounded" />
                        <div className="w-16 h-3 bg-ink-muted/40 rounded ml-auto" />
                      </div>
                    </div>
                    <div className="absolute bottom-16 right-16 w-32 h-32 rounded-full border-4 border-status-error-text/30 flex items-center justify-center transform -rotate-12">
                      <span className="text-status-error-text/30 font-headline-lg font-bold">CUSTOMS REJECT</span>
                    </div>
                  </div>
                  {/* Foreground OCR Alert Callout Card */}
                  <div className="relative z-20 w-full max-w-xl bg-surface-raised/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 flex flex-col gap-4 transform transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-status-error-bg flex items-center justify-center shrink-0">
                        <Scan className="text-status-error-text text-[28px]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-status-error-bg text-status-error-text font-label-code-sm text-label-code-sm font-bold uppercase">FAULT CODE: OCR-408-LOWDPI</span>
                          <span className="text-caption font-caption text-ink-muted">Raster Stream Error</span>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg text-ink-primary font-bold tracking-tight">
                          We couldn&apos;t read page 2. Enter the fields manually.
                        </h2>
                        <p className="font-body-md text-body-md text-ink-secondary mt-1">
                          Optical Character Recognition failed due to severe skew (1.8&deg;), low resolution (
                          <span className="font-label-code-sm font-semibold text-status-error-text">96 DPI</span>, required: &ge;150 DPI), or corrupted page stream on Page 2.
                        </p>
                      </div>
                    </div>
                    {/* Diagnostics Pill Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-lg bg-surface-base">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <X className="text-[16px] text-status-error-text" />
                        <span className="font-body-sm text-body-sm text-ink-secondary">Resolution: 96 DPI</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <X className="text-[16px] text-status-error-text" />
                        <span className="font-body-sm text-body-sm text-ink-secondary">Skew Angle: +1.84&deg;</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <AlertTriangle className="text-[16px] text-status-review-text" />
                        <span className="font-body-sm text-body-sm text-ink-secondary">Extracted: 0/5 fields</span>
                      </div>
                    </div>
                    {/* Diagnostic SVG Waveform Graphic */}
                    <div className="w-full h-10 bg-surface-container-high/50 rounded-lg flex items-center px-3 justify-between overflow-hidden">
                      <span className="font-caption text-caption text-ink-muted">Scan Intensity Profile:</span>
                      <svg className="h-6 w-56 text-status-error-text" fill="none" viewBox="0 0 200 24">
                        <path d="M0 12 Q 20 2, 40 12 T 80 12 T 120 20 T 160 4 T 200 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                        <circle cx="160" cy="4" fill="currentColor" r="3" />
                      </svg>
                      <span className="font-label-code-sm text-label-code-sm text-status-error-text font-bold">SNR: 4.2 dB</span>
                    </div>
                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Button size="sm" className="px-4 py-2 rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Upload replacement page</span>
                      </Button>
                      <Button size="sm" variant="outline" className="px-3.5 py-2 rounded-lg bg-surface-base text-ink-primary font-headline-sm text-headline-sm hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm">
                        <RefreshCw className="w-4 h-4 text-primary" />
                        <span>Retry OCR scan</span>
                      </Button>
                      <Button size="sm" variant="outline" className="px-3 py-2 rounded-lg bg-surface-base text-ink-secondary font-headline-sm text-headline-sm hover:text-ink-primary hover:bg-surface-container transition-colors flex items-center gap-1.5 ml-auto shadow-sm">
                        <ZoomIn className="w-4 h-4 text-primary" />
                        <span>Zoom to inspect</span>
                      </Button>
                    </div>
                  </div>
                  {/* Bottom Floating Status Chip on Left Canvas */}
                  <div className="absolute bottom-4 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-raised/90 backdrop-blur-md shadow-md text-ink-secondary font-label-code-sm text-label-code-sm">
                    <EyeOff className="text-status-error-text text-[16px]" />
                    <span>Raster Buffer: Raw Frame 2/3 (Corrupted)</span>
                  </div>
                </div>
              </section>
              {/* RIGHT SIDE (45% on XL): Field Extraction Panel Adapting to Manual Input */}
              <section className="xl:col-span-5 flex flex-col bg-surface-raised rounded-xl shadow-md overflow-hidden">
                {/* Sticky Sub-Header with Alert Counter */}
                <div className="sticky top-0 z-30 px-4 py-2 bg-status-review-bg text-status-review-text flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-status-review-text text-surface-raised flex items-center justify-center font-headline-sm text-headline-sm font-bold">5</div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm font-bold tracking-tight">Page 2 Unreadable</h3>
                      <p className="font-caption text-caption text-status-review-text/90">5 manual entries required for validation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-raised/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-status-review-text font-label-code-sm text-label-code-sm font-semibold shadow-sm">
                    <Edit className="text-[14px]" />
                    <span>Manual Fallback</span>
                  </div>
                </div>
                {/* Scrollable Extraction Form Fields */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
                  {/* Context Notification */}
                  <div className="px-4 py-2 rounded-lg bg-surface-base flex items-start gap-2">
                    <Info className="text-primary text-[20px] shrink-0 mt-0.5" />
                    <div className="font-body-sm text-body-sm text-ink-secondary">
                      Input verified values from physical paper copy or inspect the left magnified scan. Auto-save triggers on field blur.
                    </div>
                  </div>
                  {/* Line Items Section Flagged for Manual Entry */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption uppercase text-ink-muted tracking-wider">Unverified Item 05 (Page 2)</span>
                      <span className="font-label-code-sm text-label-code-sm text-status-error-text font-medium">Missing OCR Match</span>
                    </div>
                    {/* Field 1: Description */}
                    <div className="p-3 rounded-lg bg-surface-container-low focus-within:bg-surface-raised focus-within:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="item-desc-05" className="font-headline-sm text-headline-sm text-ink-primary font-semibold flex items-center gap-1.5">
                          Line Item 05 - Description
                          <span className="text-status-error-text">*</span>
                        </label>
                        <span className="px-1.5 py-0.5 rounded bg-status-review-bg text-status-review-text font-medium">Enter manually</span>
                      </div>
                      <div className="relative">
                        <input
                          id="item-desc-05"
                          type="text"
                          placeholder="e.g. Stainless Steel Fasteners DIN 933"
                          defaultValue="Stainless Steel Fasteners DIN 933 (Pending Spec)"
                          className="w-full h-10 px-3 bg-surface-raised rounded-md font-body-md text-body-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                        <Button type="button" size="sm" className="absolute right-2 top-2 text-primary hover:text-primary-container p-0.5 rounded" title="Confirm field" aria-label="Confirm field">
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="font-caption text-caption text-ink-muted mt-1.5 flex items-center gap-1">
                        <Edit className="text-[12px] text-status-review-text" />
                        <span>Press Enter to save value or Tab to advance.</span>
                      </p>
                    </div>
                    {/* Field 2: HSN / Tariff Code */}
                    <div className="p-3 rounded-lg bg-surface-container-low focus-within:bg-surface-raised focus-within:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="item-hsn-05" className="font-headline-sm text-headline-sm text-ink-primary font-semibold flex items-center gap-1.5">
                          Line Item 05 - HS Code (8-Digit)
                          <span className="text-status-error-text">*</span>
                        </label>
                        <span className="px-1.5 py-0.5 rounded bg-status-review-bg text-status-review-text font-medium">Enter manually</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          id="item-hsn-05"
                          type="text"
                          placeholder="e.g. 7318.15.20"
                          className="w-full h-10 px-3 bg-surface-raised rounded-md font-label-code-md text-label-code-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                        <Button type="button" size="sm" className="px-3 h-10 rounded-md bg-surface-base hover:bg-surface-container font-body-sm text-body-sm text-ink-primary shrink-0 transition-colors">
                          Lookup HS
                        </Button>
                      </div>
                    </div>
                    {/* Field 3 & 4: Quantity & Unit Price Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-surface-container-low focus-within:bg-surface-raised focus-within:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="item-qty-05" className="font-headline-sm text-headline-sm text-ink-primary font-semibold flex items-center gap-1">
                            Quantity
                            <span className="text-status-error-text">*</span>
                          </label>
                          <span className="font-label-code-sm text-label-code-sm text-status-review-text">Manual</span>
                        </div>
                        <div className="relative">
                          <input id="item-qty-05" type="number" placeholder="0" className="w-full h-10 px-3 bg-surface-raised rounded-md font-label-code-md text-label-code-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                          <span className="absolute right-3 top-2.5 font-label-code-sm text-label-code-sm text-ink-muted">PCS</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-container-low focus-within:bg-surface-raised focus-within:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="item-price-05" className="font-headline-sm text-headline-sm text-ink-primary font-semibold flex items-center gap-1">
                            Unit Price (USD)
                            <span className="text-status-error-text">*</span>
                          </label>
                          <span className="font-label-code-sm text-label-code-sm text-status-review-text">Manual</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 font-label-code-sm text-label-code-sm text-ink-muted">$</span>
                          <input id="item-price-05" type="text" placeholder="0.00" className="w-full h-10 pl-7 pr-3 bg-surface-raised rounded-md font-label-code-md text-label-code-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                        </div>
                      </div>
                    </div>
                    {/* Field 5: Subtotal */}
                    <div className="p-3 rounded-lg bg-surface-container-low focus-within:bg-surface-raised focus-within:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="item-subtotal-p2" className="font-headline-sm text-headline-sm text-ink-primary font-semibold flex items-center gap-1.5">
                          Total Page 2 Subtotal
                          <span className="text-status-error-text">*</span>
                        </label>
                        <span className="px-1.5 py-0.5 rounded bg-status-review-bg text-status-review-text font-medium">Reconciliation target</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 font-label-code-sm text-label-code-sm text-ink-muted">$</span>
                        <input id="item-subtotal-p2" type="text" placeholder="Sum of Line Items on Page 2" className="w-full h-10 pl-7 pr-3 bg-surface-raised rounded-md font-label-code-md text-label-code-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Cross-checks & Compliance Section Paused */}
                  <div className="p-4 rounded-xl bg-status-review-bg/50 flex flex-col gap-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-status-review-text text-[20px]" />
                        <span className="font-headline-sm text-headline-sm font-semibold text-ink-primary">Cross-Checks Suspended</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-status-review-bg text-status-review-text font-label-code-sm text-label-code-sm font-bold">PAUSED</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-ink-secondary">
                      Gross weight &amp; customs value reconciliation paused pending Page 2 manual entry confirmation.
                    </p>
                    <div className="space-y-1.5 text-ink-secondary font-label-code-sm text-label-code-sm">
                      <div className="flex justify-between py-1 bg-surface-raised/60 px-2 rounded">
                        <span>Invoice vs Packing List (Weight):</span>
                        <span className="text-status-review-text font-bold">Awaiting Page 2 Items</span>
                      </div>
                      <div className="flex justify-between py-1 bg-surface-raised/60 px-2 rounded">
                        <span>Declared Total Value vs BL:</span>
                        <span className="text-status-review-text font-bold">Calculation Locked</span>
                      </div>
                    </div>
                  </div>
                  {/* Fast Add Row Helper */}
                  <Button type="button" size="sm" className="w-full py-2.5 rounded-lg bg-surface-base hover:bg-surface-container text-ink-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-colors">
                    <PlusCircle className="text-primary" />
                    <span>+ Add additional unread line row</span>
                  </Button>
                </div>
              </section>
            </div>
          </div>
          {/* BOTTOM BAR: Fixed Docked Actions Bar */}
          <div className="w-full bg-surface-raised shadow-md px-4 lg:px-8 py-2 mt-auto z-40 shrink-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Keycap Shortcuts */}
              <div className="flex items-center gap-4 flex-wrap text-ink-secondary">
                <span className="font-caption text-caption uppercase text-ink-muted tracking-wider font-semibold">Shortcuts:</span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-0.5 rounded bg-surface-base text-ink-primary font-label-code-sm text-label-code-sm shadow-sm">Tab</kbd>
                  <span className="font-body-sm text-body-sm">next input</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-0.5 rounded bg-surface-base text-ink-primary font-label-code-sm text-label-code-sm shadow-sm">Enter</kbd>
                  <span className="font-body-sm text-body-sm">save field</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-0.5 rounded bg-surface-base text-ink-primary font-label-code-sm text-label-code-sm shadow-sm">Esc</kbd>
                  <span className="font-body-sm text-body-sm">cancel</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-2 py-0.5 rounded bg-surface-base text-ink-primary font-label-code-sm text-label-code-sm shadow-sm">Alt + R</kbd>
                  <span className="font-body-sm text-body-sm">retry OCR</span>
                </div>
              </div>
              {/* Actions & Disabled Status Explanation */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="font-body-sm text-body-sm font-semibold text-status-error-text flex items-center gap-1 justify-end">
                    <Lock className="w-4 h-4" />
                    <span>Approval Locked</span>
                  </span>
                  <span className="font-caption text-caption text-ink-muted">Resolve unreadable Page 2 manual fields to proceed</span>
                </div>
                <Button type="button" size="sm" variant="outline" className="px-4 py-2 rounded-lg bg-surface-base text-ink-secondary font-headline-sm text-headline-sm hover:bg-surface-container transition-colors">
                  Save Draft
                </Button>
                {/* Primary Disabled State Button with Tooltip Wrapper */}
                <div className="relative group">
                  <Button type="button" size="sm" disabled className="px-5 py-2.5 rounded-lg bg-surface-container-highest text-ink-muted font-headline-sm text-headline-sm cursor-not-allowed opacity-70 flex items-center gap-2 shadow-none">
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark ready for approval</span>
                  </Button>
                  {/* Interactive Hover Explanation for Disabled State */}
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-64 p-2.5 bg-[#263141] text-[#ebf1ff] rounded-lg shadow-xl text-caption font-caption z-50">
                    <div className="font-bold flex items-center gap-1 text-[#ffffff]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Action Blocked</span>
                    </div>
                    <span>Page 2 contains 5 unconfirmed mandatory invoice values. Complete manual input or upload an alternate high-resolution page scan.</span>
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

