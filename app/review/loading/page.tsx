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
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReviewLoadingPage() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-raised/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-14 w-full px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
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
          <div className="flex items-center gap-4">
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
        <div className="flex flex-col w-full pb-10">
          <div className="w-full px-4 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-raised p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 animate-pulse">
                  <Loader2 className="text-primary text-[24px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-headline-sm text-headline-sm text-ink-primary">SHP-24811 Verification Pipeline</h1>
                    <span className="px-2 py-0.5 rounded-full bg-status-progress-bg text-status-progress-text font-label-code-sm text-label-code-sm font-medium animate-pulse">AI OCR v4.9 Active</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted">Consignment: Hamburg Port Authority → Port of Long Beach • Carrier: Maersk Line</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <span className="font-label-code-md text-label-code-md text-ink-primary">Parser Stage 2/3</span>
                  </div>
                  <span className="font-caption text-caption text-ink-muted">Cross-correlating 3 manifest files</span>
                </div>
                <div className="w-32 bg-surface-container rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary h-2.5 rounded-full w-2/3 transition-all duration-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 lg:px-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-p-6 items-start">
              <div className="xl:col-span-7 flex flex-col bg-surface-raised rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-surface-base">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="px-3.5 py-1.5 rounded-lg bg-surface-raised shadow-sm font-label-code-sm text-label-code-sm text-ink-primary flex items-center gap-2 no-underline active:border-transparent">
                      <FileText className="text-primary text-[16px]" />
                      <span>Commercial_Inv_8820.pdf</span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-3.5 py-1.5 rounded-lg font-label-code-sm text-label-code-sm text-ink-muted hover:text-ink-primary flex items-center gap-2 no-underline">
                      <FileText className="text-[16px]" />
                      <span>Packing_List_Final.pdf</span>
                    </Button>
                    <Button variant="outline" size="sm" className="px-3.5 py-1.5 rounded-lg font-label-code-sm text-label-code-sm text-ink-muted hover:text-ink-primary flex items-center gap-2 no-underline">
                      <Truck className="text-[16px]" />
                      <span>BOL_MAE_99214.pdf</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-ink-secondary text-body-sm">
                    <div className="flex items-center bg-surface-container rounded-lg p-1 gap-1">
                      <Minus className="w-7 h-7 rounded flex items-center justify-center bg-surface-raised shadow-xs text-ink-primary cursor-not-allowed opacity-60" />
                      <span className="font-label-code-sm text-label-code-sm px-2 text-ink-muted">100%</span>
                      <Plus className="w-7 h-7 rounded flex items-center justify-center bg-surface-raised shadow-xs text-ink-primary cursor-not-allowed opacity-60" />
                    </div>
                    <div className="w-px h-5 bg-surface-container-high mx-1"></div>
                    <div className="flex items-center gap-1 bg-surface-container rounded-lg px-2.5 py-1 text-ink-muted font-label-code-sm text-label-code-sm">
                      <span>Page 1 / 3</span>
                    </div>
                  </div>
                </div>
                <div className="relative bg-surface-base p-6 min-h-[740px] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                  <div className="w-full max-w-[580px] bg-surface-raised rounded-lg shadow-md p-8 flex flex-col gap-6 relative">
                    <div className="flex justify-between items-start pb-4 border-b border-surface-container">
                      <div className="space-y-2">
                        <div className="h-6 w-36 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-3 w-52 bg-surface-container rounded animate-pulse" />
                        <div className="h-3 w-40 bg-surface-container rounded animate-pulse" />
                      </div>
                      <div className="h-12 w-28 bg-surface-container-high rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-surface-container">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                        <div className="h-4 w-44 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-3 w-32 bg-surface-container rounded animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                        <div className="h-4 w-40 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-3 w-28 bg-surface-container rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-7 w-full bg-surface-container rounded flex items-center px-3 justify-between">
                        <div className="h-3 w-24 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-3 w-16 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-3 w-16 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-3 w-20 bg-surface-container-highest rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-full bg-surface-container-low rounded animate-pulse" />
                      <div className="h-5 w-full bg-surface-container-low rounded animate-pulse" />
                      <div className="h-5 w-full bg-surface-container-low rounded animate-pulse" />
                      <div className="h-5 w-full bg-surface-container-low rounded animate-pulse" />
                      <div className="h-5 w-full bg-surface-container-low rounded animate-pulse" />
                    </div>
                    <div className="flex justify-end pt-4">
                      <div className="space-y-2 w-44">
                        <div className="h-3 w-full bg-surface-container rounded animate-pulse" />
                        <div className="h-4 w-full bg-surface-container-highest rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-surface-raised/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin h-7 w-7 text-primary" />
                      </div>
                      <p className="font-headline-sm text-headline-sm text-ink-primary">Rendering high-resolution vector PDF...</p>
                      <p className="font-body-sm text-body-sm text-ink-muted mt-1">(Page 1 of 3) • Generating OCR spatial coordinates</p>
                      <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container">
                        <RefreshCw className="text-primary text-[18px] animate-pulse" />
                        <span className="font-label-code-sm text-label-code-sm text-ink-secondary">Tesseract OCR neural layer matching tokens</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-surface-raised flex items-center justify-between text-ink-muted font-label-code-sm text-label-code-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <EyeOff className="text-[16px]" />
                      <span>Layer: Optical Flow</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="text-[16px]" />
                      <span>Scale: Auto-Fit (1440x900)</span>
                    </span>
                  </div>
                  <span className="font-caption text-caption text-ink-muted">Checksum: SHA256:7f9a...3b21</span>
                </div>
              </div>
              <div className="xl:col-span-5 flex flex-col space-y-4">
                <div className="bg-surface-raised rounded-xl p-4 shadow-sm sticky top-16 z-20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="text-primary text-[20px] animate-spin" />
                      <span className="font-headline-sm text-headline-sm text-ink-primary">Analyzing 21 fields...</span>
                    </div>
                    <span className="font-label-code-sm text-label-code-sm px-2.5 py-1 rounded bg-status-review-bg text-status-review-text font-medium">Stage 2: Validation</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-ink-muted mb-3">Extracting document semantics &amp; cross-checking HS classification codes</p>
                  <div className="relative w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-primary w-3/5 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 w-32 bg-surface-container-highest rounded animate-pulse" />
                    <div className="h-3 w-16 bg-surface-container rounded animate-pulse" />
                  </div>
                  <div className="p-3 rounded-lg bg-surface-base space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-40 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-12 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-52 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-12 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-36 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-12 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-caption text-caption text-ink-muted tracking-wider uppercase font-semibold">PARTIES</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    </div>
                    <span className="font-label-code-sm text-label-code-sm text-ink-muted">3 of 3 targets detected</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-surface-base flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                        <div className="h-4 w-48 bg-surface-container-highest rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-16 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-base flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-surface-container rounded animate-pulse" />
                        <div className="h-4 w-40 bg-surface-container-highest rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-16 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-base flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="h-3 w-16 bg-surface-container rounded animate-pulse" />
                        <div className="h-4 w-36 bg-surface-container-highest rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-16 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-caption text-caption text-ink-muted tracking-wider uppercase font-semibold">INVOICE &amp; FINANCIAL TERMS</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    </div>
                    <span className="font-label-code-sm text-label-code-sm text-ink-muted">Incoterms / Currency</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-surface-base space-y-1.5">
                      <div className="h-3 w-16 bg-surface-container rounded animate-pulse" />
                      <div className="h-5 w-24 bg-surface-container-highest rounded animate-pulse" />
                    </div>
                    <div className="p-3 rounded-lg bg-surface-base space-y-1.5">
                      <div className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                      <div className="h-5 w-20 bg-surface-container-highest rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-base space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-28 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-14 bg-surface-container-high rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-36 bg-surface-container-highest rounded animate-pulse" />
                  </div>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-caption text-caption text-ink-muted tracking-wider uppercase font-semibold">GOODS CLASSIFICATION (HS CODES)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-status-review-text animate-pulse"></span>
                    </div>
                    <span className="font-label-code-sm text-label-code-sm text-ink-muted">Rule 8471.30.01</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-surface-base space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-32 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-4 w-20 bg-surface-container-high rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-full bg-surface-container rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-surface-container rounded animate-pulse" />
                    </div>
                    <div className="p-3 rounded-lg bg-surface-base space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-28 bg-surface-container-highest rounded animate-pulse" />
                        <div className="h-4 w-20 bg-surface-container-high rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-5/6 bg-surface-container rounded animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="bg-surface-raised rounded-xl p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <span className="font-caption text-caption text-ink-muted tracking-wider uppercase font-semibold">PACKING, WEIGHTS &amp; CONTAINERS</span>
                    <span className="font-label-code-sm text-label-code-sm text-ink-muted">Gross / Net Match</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-base space-y-1">
                      <div className="h-2.5 w-12 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-16 bg-surface-container-highest rounded animate-pulse" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-base space-y-1">
                      <div className="h-2.5 w-14 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-16 bg-surface-container-highest rounded animate-pulse" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-base space-y-1">
                      <div className="h-2.5 w-10 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-14 bg-surface-container-highest rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-base space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-24 bg-surface-container rounded animate-pulse" />
                      <div className="h-4 w-16 bg-surface-container-high rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-40 bg-surface-container-highest rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full px-4 lg:px-8 mt-6">
            <div className="bg-surface-raised rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-ink-muted">
                <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider">Shortcuts:</span>
                <div className="flex items-center gap-1.5 opacity-60">
                  <kbd className="px-2 py-1 rounded bg-surface-container font-label-code-sm text-label-code-sm text-ink-secondary shadow-xs">J</kbd>
                  <kbd className="px-2 py-1 rounded bg-surface-container font-label-code-sm text-label-code-sm text-ink-secondary shadow-xs">K</kbd>
                  <span className="font-body-sm text-body-sm">Next Field</span>
                </div>
                <span className="h-3 w-px bg-surface-container"></span>
                <div className="flex items-center gap-1.5 opacity-60">
                  <kbd className="px-2 py-1 rounded bg-surface-container font-label-code-sm text-label-code-sm text-ink-secondary shadow-xs">Space</kbd>
                  <span className="font-body-sm text-body-sm">Confirm Match</span>
                </div>
                <span className="h-3 w-px bg-surface-container"></span>
                <div className="flex items-center gap-1.5 opacity-60">
                  <kbd className="px-2 py-1 rounded bg-surface-container font-label-code-sm text-label-code-sm text-ink-secondary shadow-xs">E</kbd>
                  <span className="font-body-sm text-body-sm">Flag Discrepancy</span>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button type="button" size="sm" disabled className="px-4 py-2 rounded-lg bg-surface-base text-ink-muted font-body-md text-body-md cursor-not-allowed">
                  Discard Session
                </Button>
                <Button type="button" size="sm" disabled className="px-5 py-2.5 rounded-lg bg-primary/70 text-on-primary font-body-md text-body-md flex items-center justify-center gap-2.5 cursor-not-allowed shadow-sm min-w-[260px]">
                  <Loader2 className="animate-spin h-4 w-4 text-white" />
                  <span>Processing verification rules...</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

