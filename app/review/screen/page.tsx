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
  ChevronUp,
  RefreshCw,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewScreenPage() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-raised/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 w-full px-space-md lg:px-space-xl flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <ShieldCheck className="text-primary text-[22px]" />
              <span className="font-headline-sm text-headline-sm tracking-tight text-ink-primary">Customs Doc Check</span>
            </div>
            <span className="h-4 w-px bg-outline-variant/60"></span>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 font-body-sm text-body-sm text-ink-secondary hover:text-ink-primary transition-colors no-underline"
            >
              <ArrowLeft className="text-[16px]" />
              <span>Shipments</span>
            </Link>
            <span className="h-4 w-px bg-outline-variant/60"></span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-status-progress-bg text-status-progress-text font-label-code-sm text-label-code-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-status-progress-text animate-pulse" />
              <span>SHP-24811 • Review Mode</span>
            </span>
          </div>
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-lg bg-surface-base" data-active-classes="bg-surface-container text-ink-primary font-semibold">
            <Link href="/dashboard" className="px-3 py-1 rounded font-body-sm text-body-sm text-ink-secondary hover:text-ink-primary transition-colors no-underline">
              Matrix
            </Link>
            <Link href="/review/screen" aria-current="page" className="px-3 py-1 rounded transition-colors bg-surface-container text-ink-primary font-semibold no-underline">
              Split Review
            </Link>
            <Link href="/dashboard" className="px-3 py-1 rounded font-body-sm text-body-sm text-ink-secondary hover:text-ink-primary transition-colors no-underline">
              Accuracy Report
            </Link>
            <Link href="/dashboard" className="px-3 py-1 rounded font-body-sm text-body-sm text-ink-secondary hover:text-ink-primary transition-colors no-underline">
              Audit Log
            </Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <div className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-status-confirmed-bg text-status-confirmed-text font-label-code-sm text-label-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <span className="hidden md:block h-4 w-px bg-outline-variant/60"></span>
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-label-code-sm text-label-code-sm text-ink-primary">manager@demo.local</span>
              <span className="font-caption text-caption text-ink-muted uppercase tracking-wider">Documentation Manager</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-14 bg-surface min-h-[calc(100vh-3rem)]">
        <div className="flex flex-col w-full h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Top Utility Context Bar */}
          <div className="w-full bg-surface-container-lowest px-space-md py-2 flex items-center justify-between text-ink-secondary text-body-sm shadow-sm z-20">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-ink-primary font-semibold">SHP-24811</span>
                <span className="px-2 py-0.5 rounded-lg bg-surface-container text-ink-secondary font-label-code-sm">MAEU-992104-IN</span>
              </div>
              <span className="hidden md:inline text-outline-variant">•</span>
              <div className="hidden md:flex items-center gap-1.5 truncate">
                <span className="text-ink-muted">Consignee:</span>
                <span className="font-medium text-ink-primary">Apex Logistics India Ltd</span>
              </div>
              <span className="hidden lg:inline text-outline-variant">•</span>
              <div className="hidden lg:flex items-center gap-1.5 text-ink-muted">
                <span>Route:</span>
                <span className="font-label-code-sm text-ink-primary">CNSHA ➔ INNSA</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-1 text-status-review-text bg-status-review-bg px-2.5 py-1 rounded-lg font-label-code-sm">
                <span className="w-2 h-2 rounded-full bg-status-review-text animate-pulse" />
                <span className="font-semibold">Review Pending Customs Sign-off</span>
              </div>
              <Button type="button" size="sm" variant="outline" className="p-1 rounded hover:bg-surface-container text-ink-secondary hover:text-ink-primary transition-colors" title="Settings &amp; Tolerance">
                <Settings className="text-[18px]" />
              </Button>
            </div>
          </div>

          {/* Primary Asymmetric Workspace: 55% Left Document Viewer | 45% Right Extraction & Cross-Checks */}
          <div className="flex flex-1 w-full min-h-0 relative">
            {/* LEFT SIDE: 55% High-Fidelity Document Canvas */}
            <section className="w-[55%] flex flex-col h-full bg-surface-container-low relative">
              {/* Document Tab Bar */}
              <div className="h-11 bg-surface-container-lowest px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1">
                  <Button type="button" size="sm" className="h-8 px-3.5 rounded-lg bg-primary text-on-primary font-headline-sm text-body-sm flex items-center gap-2 transition-all shadow-sm" aria-pressed="true">
                    <FileText className="text-[16px]" />
                    <span className="font-medium">Commercial Invoice</span>
                    <span className="px-1.5 py-0.2 bg-white/20 text-on-primary rounded text-caption font-label-code-sm">3 pgs</span>
                  </Button>
                  <Button type="button" size="sm" className="h-8 px-3.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-container font-body-sm flex items-center gap-2 transition-all">
                    <FileText className="text-[16px]" />
                    <span>Packing List</span>
                    <span className="px-1.5 py-0.2 bg-surface-container text-ink-secondary rounded text-caption font-label-code-sm">4 pgs</span>
                  </Button>
                  <Button type="button" size="sm" className="h-8 px-3.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-container font-body-sm flex items-center gap-2 transition-all">
                    <Truck className="text-[16px]" />
                    <span>Bill of Lading</span>
                    <span className="px-1.5 py-0.2 bg-surface-container text-ink-secondary rounded text-caption font-label-code-sm">1 pg</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-status-confirmed-text font-label-code-sm bg-status-confirmed-bg px-2 py-1 rounded">
                  <Check className="text-[14px]" />
                  <span>OCR 300 DPI Raw Source</span>
                </div>
              </div>
              {/* Document Navigation & Inspection Toolbar */}
              <div className="h-10 bg-surface-container px-4 flex items-center justify-between text-ink-secondary text-body-sm">
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="outline" disabled className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-muted hover:text-ink-primary transition-colors">
                    <ChevronLeft className="text-[18px]" />
                  </Button>
                  <span className="font-label-code-sm text-ink-primary font-medium">Page 1 of 3</span>
                  <Button type="button" size="sm" variant="outline" className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-muted hover:text-ink-primary transition-colors">
                    <ChevronRight className="text-[18px]" />
                  </Button>
                  <span className="w-px h-4 bg-outline-variant/40 mx-1"></span>
                  <span className="text-caption text-ink-muted">INV-2024-8891_ORIGINAL.pdf</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button type="button" size="sm" variant="outline" className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary" id="zoom-out-btn" title="Zoom Out (-)">
                    <Minus className="text-[16px]" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="px-2 h-7 rounded flex items-center justify-center font-label-code-sm hover:bg-surface-container-high text-ink-primary" id="zoom-level-btn">
                    100%
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary" id="zoom-in-btn" title="Zoom In (+)">
                    <Plus className="text-[16px]" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary" title="Fit to Width">
                    <Maximize2 className="text-[16px]" />
                  </Button>
                  <span className="w-px h-4 bg-outline-variant/40 mx-1"></span>
                  <Button type="button" size="sm" variant="outline" className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary" title="Rotate Counterclockwise">
                    <RotateCcw className="text-[16px]" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary" title="Print Document">
                    <Download className="text-[16px]" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="w-7 h-7 rounded flex items-center justify-center hover:bg-surface-container-high text-ink-secondary hover:text-ink-primary" title="Download Raw PDF">
                    <CloudUpload className="text-[16px]" />
                  </Button>
                </div>
              </div>
              {/* Viewer Canvas with Clean Paper Presentation */}
              <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-status-neutral-bg select-text" id="pdf-canvas-container">
                <div className="w-full max-w-[620px] min-h-[780px] bg-white text-on-surface shadow-md rounded-sm p-8 transition-transform duration-200 origin-top" id="paper-document">
                  {/* Authentic Paper Header */}
                  <div className="flex justify-between items-start pb-6 shadow-[0_1px_0_0_#f1f5f9]">
                    <div>
                      <h1 className="font-headline-lg text-ink-primary tracking-tight font-bold text-lg">PACIFIC LOGISTICS CORP</h1>
                      <p className="font-body-sm text-ink-secondary">702 Marina Commercial Tower, Pudong New Area</p>
                      <p className="font-body-sm text-ink-secondary">Shanghai 200120, China • Tel: +86 21 8991 2000</p>
                      <p className="font-label-code-sm text-ink-muted mt-1">Tax Export Reg: CN-991048201X</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-surface-container text-ink-primary font-headline-sm text-headline-sm uppercase tracking-wider font-bold">Commercial Invoice</span>
                      <div className="mt-2 text-body-sm">
                        <div className="flex justify-end gap-2">
                          <span className="text-ink-muted">Invoice No:</span>
                          <span className="font-label-code-md font-bold text-ink-primary">INV-2024-8891</span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <span className="text-ink-muted">Date:</span>
                          <span className="font-label-code-md font-bold text-ink-primary">11-Jul-2026</span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <span className="text-ink-muted">Terms:</span>
                          <span className="font-label-code-md font-bold text-ink-primary">FOB SHANGHAI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Document Parties / Shipping Manifest Routing */}
                  <div className="grid grid-cols-2 gap-6 py-5 text-body-sm">
                    <div className="p-3 bg-surface-container-low rounded">
                      <span className="font-caption text-caption text-ink-muted uppercase tracking-wider block font-semibold mb-1">CONSIGNEE / IMPORTER</span>
                      <p className="font-bold text-ink-primary">APEX LOGISTICS INDIA LTD</p>
                      <p className="text-ink-secondary">Plot 45-B, Sector 8, Mahape Industrial Hub</p>
                      <p className="text-ink-secondary">Navi Mumbai, MH 400710, India</p>
                      <p className="font-label-code-sm text-ink-primary mt-1">GSTIN: <span className="font-bold">27AAAC19241Q1</span></p>
                      <p className="font-label-code-sm text-ink-secondary">IEC: 0308019482</p>
                    </div>
                    <div className="p-3 bg-surface-container-low rounded">
                      <span className="font-caption text-caption text-ink-muted uppercase tracking-wider block font-semibold mb-1">PORT &amp; TRANSPORT LOGISTICS</span>
                      <div className="grid grid-cols-2 gap-2 text-body-sm">
                        <div>
                          <span className="text-caption text-ink-muted block">Port of Loading</span>
                          <span className="font-medium text-ink-primary">Shanghai Pudong</span>
                        </div>
                        <div>
                          <span className="text-caption text-ink-muted block">Port of Discharge</span>
                          <span className="font-medium text-ink-primary">Nhava Sheva (INNSA)</span>
                        </div>
                        <div>
                          <span className="text-caption text-ink-muted block">Ocean Vessel / Voy</span>
                          <span className="font-medium text-ink-primary">MAERSK BALTIC / 448S</span>
                        </div>
                        <div>
                          <span className="text-caption text-ink-muted block">Container &amp; Seal</span>
                          <span className="font-label-code-sm font-semibold text-ink-primary">MSCU-4401928 / SL-992014</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Document Line Items Table (Paper Style) */}
                  <div className="mt-2">
                    <table className="w-full text-left text-body-sm">
                      <thead>
                        <tr className="bg-surface-container text-ink-secondary font-caption text-caption uppercase tracking-wider">
                          <th className="py-2 px-2 font-semibold">Item</th>
                          <th className="py-2 px-2 font-semibold">HS Code</th>
                          <th className="py-2 px-3 font-semibold">Description</th>
                          <th className="py-2 px-2 text-right font-semibold">Qty</th>
                          <th className="py-2 px-2 text-right font-semibold">Unit (USD)</th>
                          <th className="py-2 px-3 text-right font-semibold">Total (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container font-body-sm text-ink-primary">
                        <tr>
                          <td className="py-2.5 px-2 font-label-code-sm">01</td>
                          <td className="py-2.5 px-2 font-label-code-sm font-medium">8471.30.10</td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium">Automatic Data Processing Unit &lt; 10kg</p>
                            <span className="text-caption text-ink-muted">Commercial Micro-workstations Model Neo-14</span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-label-code-sm">140 PCS</td>
                          <td className="py-2.5 px-2 text-right font-label-code-sm">620.00</td>
                          <td className="py-2.5 px-3 text-right font-label-code-sm font-semibold">86,800.00</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-2 font-label-code-sm">02</td>
                          <td className="py-2.5 px-2 font-label-code-sm font-medium">8471.30.10</td>
                          <td className="py-2.5 px-3">
                            <p className="font-medium">Automatic Data Processing Unit &lt; 10kg</p>
                            <span className="text-caption text-ink-muted">Commercial Edge Controller v2.1</span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-label-code-sm">70 PCS</td>
                          <td className="py-2.5 px-2 text-right font-label-code-sm">800.00</td>
                          <td className="py-2.5 px-3 text-right font-label-code-sm font-semibold">56,050.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Document Totals & Physical Metrics */}
                  <div className="mt-6 pt-4 bg-surface-container-lowest flex justify-between items-start shadow-[0_-1px_0_0_#f1f5f9]">
                    <div className="space-y-1.5 text-body-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-caption uppercase text-ink-muted tracking-wider font-semibold">Gross Weight:</span>
                        <span className="font-label-code-md font-bold text-ink-primary">3,120.00 KG</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-caption uppercase text-ink-muted tracking-wider font-semibold">Net Weight:</span>
                        <span className="font-label-code-md font-medium text-ink-primary">2,940.00 KG</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-caption uppercase text-ink-muted tracking-wider font-semibold">Packages:</span>
                        <span className="font-label-code-sm text-ink-primary">14 Pallets / 280 Cartons</span>
                      </div>
                    </div>
                    <div className="w-64 bg-surface-container-low p-3 rounded text-right space-y-1">
                      <div className="flex justify-between text-body-sm">
                        <span className="text-ink-secondary">Subtotal FOB:</span>
                        <span className="font-label-code-sm font-medium text-ink-primary">$142,850.00</span>
                      </div>
                      <div className="flex justify-between text-body-sm">
                        <span className="text-ink-secondary">Freight / Insurance:</span>
                        <span className="font-label-code-sm text-ink-muted">Excluded (FOB)</span>
                      </div>
                      <div className="flex justify-between font-headline-sm text-headline-sm pt-2 text-ink-primary shadow-[0_-1px_0_0_#dee9fe]">
                        <span className="font-bold">Total Declared:</span>
                        <span className="font-label-code-md font-bold text-primary">$142,850.00 USD</span>
                      </div>
                    </div>
                  </div>
                  {/* Signature block */}
                  <div className="mt-12 pt-6 flex justify-between items-end text-caption text-ink-muted shadow-[0_1px_0_0_#f1f5f9]">
                    <div>
                      <p>Certified true and correct in all particulars.</p>
                      <p>Country of Origin: People&apos;s Republic of China</p>
                    </div>
                    <div className="text-center w-48">
                      <div className="h-10 flex items-center justify-center font-headline-sm italic text-ink-secondary opacity-70">Pacific Logistics Ltd.</div>
                      <div className="h-px bg-outline-variant/60 w-full mb-1" />
                      <span className="uppercase tracking-wider">Authorized Officer Signature</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-caption text-ink-muted font-label-code-sm">[ END OF INVOICE PAGE 1 - PAGE 2 CONTINUES SPECIFICATIONS ]</div>
                </div>
              </div>
            </section>
            {/* RIGHT SIDE: 45% Scrolling Field Extraction & Cross-Checks */}
            <section className="w-[45%] flex flex-col h-full bg-surface-raised overflow-hidden">
              {/* Sticky Verification Status Header */}
              <div className="bg-surface-raised p-space-md shadow-sm z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-error-text animate-pulse" />
                    <h2 className="font-headline-md text-headline-md text-ink-primary tracking-tight font-bold">7 to confirm · 1 check failed</h2>
                  </div>
                  <span className="font-label-code-sm text-status-progress-text bg-status-progress-bg px-2 py-0.5 rounded font-medium">14 / 21 Confirmed (67%)</span>
                </div>
                {/* Custom Visual Completion Meter */}
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
                  <div className="bg-status-confirmed-text h-full transition-all duration-300" style={{ width: "67%" }} title="14 Confirmed" />
                  <div className="bg-status-review-text h-full transition-all duration-300" style={{ width: "28%" }} title="6 Pending Confirmations" />
                  <div className="bg-status-error-text h-full transition-all duration-300" style={{ width: "5%" }} title="1 Failed Discrepancy" />
                </div>
                {/* Quick filter / helper row */}
                <div className="flex items-center justify-between text-body-sm text-ink-secondary">
                  <div className="flex items-center gap-2 text-caption font-label-code-sm">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-confirmed-text" /> 14 Valid</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-review-text" /> 6 Review</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-error-text" /> 1 Failed</span>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="text-primary hover:text-on-primary-fixed-variant font-medium text-caption flex items-center gap-1">
                    <Check className="text-[14px]" />
                    <span>Batch Accept 99%+</span>
                  </Button>
                </div>
              </div>
              {/* Scrolling Extraction Group List */}
              <div className="flex-1 overflow-y-auto px-space-md py-4 space-y-6 pb-24">
                {/* SECTION 1: PARTIES */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-caption text-caption font-bold text-ink-muted uppercase tracking-wider">1. PARTIES</h3>
                    <span className="font-label-code-sm text-caption text-ink-muted">3/3 CONFIRMED</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Consignor / Exporter</span>
                        <span className="font-medium text-ink-primary truncate">Pacific Logistics Corp</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm" title="99% extraction confidence">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 99%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Consignee Name</span>
                        <span className="font-medium text-ink-primary truncate">Apex Logistics India Ltd</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm" title="98% extraction confidence">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 98%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Consignee GSTIN / Tax ID</span>
                        <span className="font-label-code-md font-semibold text-ink-primary truncate">27AAAC19241Q1</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm" title="99% extraction confidence">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 99%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* SECTION 2: INVOICE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-caption text-caption font-bold text-ink-muted uppercase tracking-wider">2. INVOICE</h3>
                    <span className="font-label-code-sm text-caption text-status-review-text font-medium">1 TO CONFIRM</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Invoice Number</span>
                        <span className="font-label-code-md font-semibold text-ink-primary">INV-2024-8891</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 99%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Invoice Date</span>
                        <span className="font-label-code-md text-ink-primary">2026-07-11</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 99%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Declared Currency</span>
                        <span className="font-label-code-md font-bold text-ink-primary">USD</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 99%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-status-review-bg/50 shadow-[inset_3px_0_0_0_#B45309] flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-status-review-text font-semibold">Total Invoice Amount (Verification Required)</span>
                        <div className="flex items-center gap-2">
                          <span className="font-label-code-md font-bold text-ink-primary text-[15px]">$ 142,850.00</span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-container font-label-code-sm text-caption text-ink-secondary">p.1</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-status-review-text font-label-code-sm mr-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-review-text" /> 94%
                        </span>
                        <Button type="button" size="sm" className="px-2.5 py-1 bg-surface-raised hover:bg-surface-container text-ink-primary rounded text-caption font-medium transition-colors">
                          Edit
                        </Button>
                        <Button type="button" size="sm" className="px-3 py-1 bg-primary text-on-primary rounded text-caption font-semibold flex items-center gap-1 transition-all shadow-sm">
                          <Check className="text-[14px]" />
                          <span>Confirm</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* SECTION 3: GOODS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-caption text-caption font-bold text-ink-muted uppercase tracking-wider">3. GOODS SPECIFICATION</h3>
                    <span className="font-label-code-sm text-caption text-status-review-text font-medium">1 TO CONFIRM</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-status-review-bg/50 shadow-[inset_3px_0_0_0_#B45309] flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-status-review-text font-semibold">HSN / Tariff Classification</span>
                        <div className="flex items-center gap-2">
                          <span className="font-label-code-md font-bold text-ink-primary">8471.30.10</span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-container font-label-code-sm text-caption text-ink-secondary">p.1</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-status-review-text font-label-code-sm mr-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-review-text" /> 78%
                        </span>
                        <Button type="button" size="sm" className="px-2.5 py-1 bg-surface-raised hover:bg-surface-container text-ink-primary rounded text-caption font-medium transition-colors">
                          Edit
                        </Button>
                        <Button type="button" size="sm" className="px-3 py-1 bg-primary text-on-primary rounded text-caption font-semibold flex items-center gap-1 transition-all shadow-sm">
                          <Check className="text-[14px]" />
                          <span>Confirm</span>
                        </Button>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-caption text-caption text-ink-secondary">Product Description</span>
                          <span className="px-1.5 py-0.2 rounded bg-status-progress-bg text-status-progress-text font-label-code-sm text-caption font-medium">Manual edit</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 truncate">
                          <del className="line-through text-ink-muted text-body-sm">Data Process Mach</del>
                          <span className="font-medium text-ink-primary text-body-md truncate">Automatic Data Processing Unit &lt; 10kg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* SECTION 4: PACKING AND WEIGHTS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-caption text-caption font-bold text-ink-muted uppercase tracking-wider">4. PACKING AND WEIGHTS</h3>
                    <span className="font-label-code-sm text-caption text-status-error-text font-medium">2 TO CONFIRM · 1 ALERT</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-status-error-bg/40 shadow-[inset_3px_0_0_0_#ba1a1a] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-caption text-caption text-status-error-text font-bold">Gross Weight</span>
                            <span className="px-1.5 py-0.2 rounded bg-status-error-bg text-status-error-text font-caption font-semibold flex items-center gap-1">
                              <AlertTriangle className="text-[12px]" />
                              Discrepancy in cross-check
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-label-code-md font-bold text-ink-primary text-[15px]">3,120.00 kg</span>
                            <span className="px-1.5 py-0.2 rounded bg-surface-container font-label-code-sm text-caption text-ink-secondary">p.1</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-status-review-text font-label-code-sm mr-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-review-text" /> 92%
                          </span>
                          <Button type="button" size="sm" className="px-2.5 py-1 bg-surface-raised hover:bg-surface-container text-ink-primary rounded text-caption font-medium transition-colors">
                            Edit
                          </Button>
                          <Button type="button" size="sm" className="px-3 py-1 bg-primary text-on-primary rounded text-caption font-semibold flex items-center gap-1 transition-all shadow-sm">
                            <Check className="text-[14px]" />
                            <span>Confirm</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Net Weight</span>
                        <span className="font-label-code-md text-ink-primary">2,940.00 kg</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 96%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-status-review-bg/50 shadow-[inset_3px_0_0_0_#B45309] flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-status-review-text font-semibold">Total Packages</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink-primary">14 Pallets / 280 ctns</span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-container font-label-code-sm text-caption text-ink-secondary">p.1</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-status-review-text font-label-code-sm mr-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-review-text" /> 91%
                        </span>
                        <Button type="button" size="sm" className="px-2.5 py-1 bg-surface-raised hover:bg-surface-container text-ink-primary rounded text-caption font-medium transition-colors">
                          Edit
                        </Button>
                        <Button type="button" size="sm" className="px-3 py-1 bg-primary text-on-primary rounded text-caption font-semibold flex items-center gap-1 transition-all shadow-sm">
                          <Check className="text-[14px]" />
                          <span>Confirm</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* SECTION 5: CONTAINERS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-caption text-caption font-bold text-ink-muted uppercase tracking-wider">5. CONTAINERS &amp; SEALS</h3>
                    <span className="font-label-code-sm text-caption text-ink-muted">2/2 CONFIRMED</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Container Number</span>
                        <span className="font-label-code-md font-semibold text-ink-primary">MSCU-4401928</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 99%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between text-body-md">
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-ink-secondary">Seal Number</span>
                        <span className="font-label-code-md font-semibold text-ink-primary">SL-992014</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-1.5 py-0.5 bg-surface-container rounded font-label-code-sm text-ink-secondary">p.1</span>
                        <span className="flex items-center gap-1 text-status-confirmed-text font-label-code-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-confirmed-text" /> 98%
                        </span>
                        <CheckCircle className="text-status-confirmed-text text-[18px]" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* SECTION 6: AUTOMATED 3-WAY CROSS-CHECKS */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between shadow-[0_-1px_0_0_#dee9fe] pt-4">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-ink-primary font-bold">Automated 3-Way Cross-checks</h3>
                      <p className="font-body-sm text-ink-secondary">Reconciliation across Invoice, Packing List, and BL</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-code-sm text-ink-secondary font-medium">4 Checks</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Scan className="text-status-confirmed-text text-[20px]" />
                        <span className="text-body-sm font-medium text-ink-primary truncate">Consignee Tax ID (GSTIN) verification across documents</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-status-confirmed-bg text-status-confirmed-text font-label-code-sm font-semibold shrink-0">PASS</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Scan className="text-status-confirmed-text text-[20px]" />
                        <span className="text-body-sm font-medium text-ink-primary truncate">Port of Origin &amp; Destination match</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-status-confirmed-bg text-status-confirmed-text font-label-code-sm font-semibold shrink-0">PASS</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Minus className="text-ink-muted text-[20px]" />
                        <span className="text-body-sm text-ink-secondary truncate">Freight prepaid incoterm verification</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-status-neutral-bg text-status-neutral-text font-label-code-sm font-medium shrink-0">CANNOT CHECK</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-status-error-bg/30 shadow-[0_0_0_1px_#ba1a1a] space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-status-error-text text-[22px]" />
                          <div>
                            <h4 className="font-headline-sm text-headline-sm text-status-error-text font-bold">Gross Weight Variance Failure</h4>
                            <p className="text-caption text-ink-secondary">Discrepancy detected between Commercial Invoice and logistics documents</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-error text-on-error font-label-code-sm font-bold uppercase tracking-wide">Failed</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 bg-surface-raised p-2.5 rounded text-center">
                        <div className="p-1.5 rounded bg-status-error-bg/40">
                          <span className="text-caption text-status-error-text block font-semibold uppercase">Invoice</span>
                          <span className="font-label-code-md font-bold text-status-error-text">3,120 kg</span>
                        </div>
                        <div className="p-1.5 rounded bg-surface-container-low">
                          <span className="text-caption text-ink-secondary block font-semibold uppercase">Packing List</span>
                          <span className="font-label-code-md font-bold text-ink-primary">3,165 kg</span>
                        </div>
                        <div className="p-1.5 rounded bg-surface-container-low">
                          <span className="text-caption text-ink-secondary block font-semibold uppercase">Bill of Lading</span>
                          <span className="font-label-code-md font-bold text-ink-primary">3,165 kg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-status-review-bg text-status-review-text font-label-code-sm text-caption">
                        <Info className="text-[16px]" />
                        <span>Difference: <strong className="text-status-review-text">+45 kg (+1.4%)</strong> against configured <strong className="text-status-review-text">0.5%</strong> tolerance limit.</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button type="button" size="sm" variant="outline" className="px-3 py-1 rounded bg-surface-raised hover:bg-surface-container text-ink-primary font-body-sm font-medium flex items-center gap-1 transition-colors">
                          Go to field
                          <ChevronUp className="text-[14px]" />
                        </Button>
                        <Button type="button" size="sm" className="px-3.5 py-1 rounded bg-error text-on-error hover:bg-on-error-container font-body-sm font-semibold transition-colors shadow-sm">
                          Resolve with note
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* FIXED BOTTOM DOCKED ACTION BAR */}
          <footer className="h-14 w-full bg-surface-raised px-space-md lg:px-space-xl flex items-center justify-between shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-30 shrink-0">
            {/* Keyboard Shortcut Keycap Cheatsheet */}
            <div className="hidden md:flex items-center gap-3 text-caption text-ink-secondary">
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-surface-container rounded font-label-code-sm font-bold text-ink-primary shadow-sm">J</kbd>
                <span>/</span>
                <kbd className="px-2 py-0.5 bg-surface-container rounded font-label-code-sm font-bold text-ink-primary shadow-sm">K</kbd>
                <span>next / prev field</span>
              </div>
              <span className="w-px h-3.5 bg-outline-variant/60"></span>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-surface-container rounded font-label-code-sm font-bold text-ink-primary shadow-sm">Enter</kbd>
                <span>confirm</span>
              </div>
              <span className="w-px h-3.5 bg-outline-variant/60"></span>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-surface-container rounded font-label-code-sm font-bold text-ink-primary shadow-sm">E</kbd>
                <span>edit</span>
              </div>
              <span className="w-px h-3.5 bg-outline-variant/60"></span>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-surface-container rounded font-label-code-sm font-bold text-ink-primary shadow-sm">Esc</kbd>
                <span>discard</span>
              </div>
            </div>
            {/* Final Approval Action Button */}
            <div className="flex items-center gap-space-md ml-auto">
              <div className="text-right">
                <div className="font-caption text-status-error-text font-medium flex items-center justify-end gap-1">
                  <Lock className="text-[14px]" />
                  <span>Disabled: 7 unconfirmed fields &amp; 1 failed cross-check</span>
                </div>
                <span className="font-caption text-ink-muted hidden lg:block">Sign-off creates cryptographic clearance receipt in Customs Ledger</span>
              </div>
              <Button type="button" size="sm" disabled className="h-9 px-5 rounded-lg bg-surface-container text-ink-muted font-body-sm font-semibold flex items-center gap-2 cursor-not-allowed opacity-75 shadow-none">
                <CheckCircle className="w-4 h-4" />
                <span>Mark Ready for Approval</span>
              </Button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
