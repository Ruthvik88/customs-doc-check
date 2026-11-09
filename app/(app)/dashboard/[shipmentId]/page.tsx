"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  CreditCard,
  Play,
  Receipt,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  CloudUpload,
  RefreshCw,
  MoreVertical,
  ClipboardCheck,
  Sliders,
  Table,
  ExternalLink,
  History,
  Code,
  Terminal,
} from "lucide-react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

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

const STATUS_VARIANT: Record<string, "confirmed" | "error" | "review" | "progress" | "neutral"> = {
  Approved: "confirmed",
  Exported: "confirmed",
  "Needs review": "review",
  Extracting: "progress",
  Draft: "neutral",
};

interface DocItem {
  name: string;
  file: string;
  icon: React.ElementType;
  status: string;
  variant: "confirmed" | "error" | "review" | "progress" | "neutral";
  progress?: number | null;
  fields?: string;
  declared?: string;
  hsns?: string;
  reading?: string;
  remaining?: string;
  alert?: string;
  alertText?: string;
  actions?: Array<{
    label: string;
    icon: React.ElementType;
    variant?: "error";
    href?: string;
    hint?: string;
  }>;
}

const DOCUMENTS: DocItem[] = [
  {
    name: "Commercial Invoice",
    file: "INV-2024-8891.pdf (1.4 MB)",
    icon: Receipt,
    status: "Extracted",
    variant: "confirmed",
    progress: 100,
    fields: "22 found · 3 uncertain",
    declared: "$142,850.00",
    hsns: "8471.30 (14 lines)",
    actions: [{ label: "View Document", icon: ExternalLink }],
  },
  {
    name: "Packing List",
    file: "PKL_Apex_v2_scan.pdf (3.8 MB)",
    icon: FileText,
    status: "Extraction Failed",
    variant: "error",
    progress: null,
    alert: "OCR Table Matrix Failure",
    alertText: "Low scan quality (120 DPI) or corrupted table structure prevented automatic field mapping.",
    actions: [
      { label: "Re-upload doc", icon: CloudUpload, href: "#" },
      { label: "Enter manually", icon: ClipboardCheck, variant: "error" },
    ],
  },
  {
    name: "Bill of Lading",
    file: "BOL-AX-7720-Final.pdf (2.1 MB)",
    icon: Activity,
    status: "Extracting 68%",
    variant: "progress",
    progress: 68,
    reading: "Reading line items & container tags…",
    remaining: "Est. time remaining: 6s",
    actions: [
      { label: "+ Add Cert of Origin", icon: MoreVertical, hint: "PDF, PNG &lt;10MB" },
    ],
  },
];

const RECONCILIATION_ROWS = [
  { field: "Gross Weight", invoice: "18,400.00 kg", bol: "18,400.00 kg", packing: "[Manual Entry Req.]", status: "error" as const, statusLabel: "Missing" },
  { field: "Declared Value", invoice: "$142,850.00 USD", bol: "N/A (Freight Prepaid)", packing: "N/A", status: "confirmed" as const, statusLabel: "Matched" },
  { field: "Consignee & GSTIN", invoice: "Apex Logistics IN · 27AAAC19241Q1", bol: "Apex Logistics India Ltd. · 27AAAC19241Q1 (Verified)", packing: "Pending Scan", status: "review" as const, statusLabel: "Punct. Diff" },
  { field: "Port Route", invoice: "PVG → INNSA", bol: "PVG → INNSA", packing: "PVG (Origin)", status: "confirmed" as const, statusLabel: "Matched" },
  { field: "Incoterms", invoice: "CIF Nhava Sheva (2020)", bol: "CIF Port of Destination", packing: "CIF", status: "confirmed" as const, statusLabel: "Matched" },
  { field: "HSN Tariff Classification", invoice: "8471.30.10 (78% Conf.)", bol: "Generic: ADP Machines", packing: "Unparsed", status: "review" as const, statusLabel: "Verify" },
] as const;

const AUDIT_ROWS = [
  { ts: "2026-07-11 14:10:22", actor: "c.torres", role: "Senior Customs Broker", field: "Consignee Tax ID (GSTIN)", from: "27AAAB88191Z1", to: "27AAAC19241Q1", toVariant: "confirmed" as const, note: "Corrected from official DGFT import portal certificate #DGFT-9912." },
  { ts: "2026-07-11 11:32:05", actor: "ai-system", role: "OCR Engine v4.2", field: "Gross Weight", from: "18,392.50 kg", to: "18,400.00 kg", toVariant: "confirmed" as const, note: "Matched master airway bill weight header with 100% confidence." },
  { ts: "2026-07-11 10:45:18", actor: "m.kumar", role: "Compliance Auditor", field: "HSN Tariff Classification", from: "8471.49.00", to: "8471.30.10", toVariant: "review" as const, note: "Updated from portable data processing sub-heading guideline." },
  { ts: "2026-07-11 09:18:44", actor: "ai-system", role: "Ingestion Gateway", field: "Incoterms", from: "[Null]", to: "CIF Nhava Sheva", toVariant: "confirmed" as const, note: "Extracted from Commercial Invoice footer clause." },
] as const;

export default function ShipmentDetailPage({ params }: { params: { shipmentId: string } }) {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "ocr">("overview");

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
      .eq("id", params.shipmentId)
      .maybeSingle();
    if (queryError) {
      setError(`Could not load shipment: ${queryError.message}`);
      setLoading(false);
      return;
    }
    setShipment((data ?? null) as Shipment | null);
    setLoading(false);
  }, [supabase, params.shipmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full bg-customs-surface-container-high rounded animate-pulse"></div>
        <p className="mt-4 text-sm text-customs-ink-secondary">Loading shipment…</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <section className="rounded-xl border border-customs-status-error-bg bg-customs-status-error-bg/20 p-6 shadow-sm flex flex-col items-center justify-center" role="alert">
        <MoreVertical className="w-8 h-8 rounded-lg bg-customs-error text-customs-on-error flex items-center justify-center mb-3 shadow-sm" />
        <h2 className="font-headline-md text-headline-md font-bold text-customs-ink-primary mb-1">Shipment Not Found</h2>
        <p className="font-body-md text-body-md text-customs-ink-secondary">{error || "No shipment matches this reference."}</p>
        <Button type="button" variant="outline" size="sm" className="mt-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to Shipments
        </Button>
      </section>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Breadcrumbs & top nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-customs-surface-raised shadow-sm text-customs-ink-secondary font-headline-sm text-headline-sm flex items-center gap-2 hover:bg-customs-surface-container-low transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Shipments
          </Button>
          <div className="h-4 w-px bg-customs-outline-variant/40 mx-1 hidden sm:block"></div>
          <nav className="flex items-center gap-2 font-caption text-caption text-customs-ink-muted">
            <Link href="/dashboard" className="hover:text-customs-ink-primary transition-colors no-underline">
              Shipments
            </Link>
            <span className="text-customs-outline-variant">/</span>
            <span className="font-label-code-sm text-label-code-sm text-customs-primary font-semibold">{shipment.shipment_number}</span>
          </nav>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-customs-surface-raised shadow-sm font-label-code-sm text-label-code-sm text-customs-ink-secondary">
            <RefreshCw className="w-4 h-4 text-customs-primary" aria-hidden="true" />
            Auto-saved 2m ago
          </span>
          <StatusBadge variant={STATUS_VARIANT[shipment.status] ?? "neutral"} label={shipment.status} />
        </div>
      </div>

      {/* Shipment header record bar */}
      <div className="bg-customs-surface-raised rounded-xl shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-label-code-md text-headline-lg font-bold text-customs-ink-primary tracking-tight">{shipment.shipment_number}</h1>
            <span className="px-2.5 py-0.5 rounded-md bg-customs-secondary-container/40 text-customs-on-secondary-container font-headline-sm text-headline-sm">
              Air Cargo
            </span>
            <span className="font-label-code-sm text-label-code-sm text-customs-ink-muted">Ref: #AX-9081</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-customs-status-review-bg text-customs-status-review-text font-label-code-sm text-label-code-sm font-medium">
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              3 Discrepancies
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-customs-ink-secondary font-caption text-caption">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4" aria-hidden="true" />
              <span className="font-medium text-customs-ink-primary">Pacific Logistics Corp</span>
              <span className="text-customs-ink-muted">(Apex Logistics Hub)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4" aria-hidden="true" style={{ background: "conic-gradient(from 0deg, #0046d4 0deg 25%, #cbd5e1 25deg 360deg)" }}></span>
              <span>Port:</span>
              <span className="font-label-code-sm text-label-code-sm font-semibold text-customs-ink-primary">Nhava Sheva (INNSA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              <span>Declared:</span>
              <span className="font-label-code-sm text-label-code-sm font-semibold text-customs-status-confirmed-text">$142,850.00 USD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Created:</span>
              <span className="font-label-code-sm text-label-code-sm text-customs-ink-secondary">2026-07-11 09:15 UTC</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
          <Button type="button" variant="outline" size="sm" className="bg-customs-surface-base hover:bg-customs-surface-container text-customs-ink-primary font-headline-sm text-headline-sm transition-colors shadow-sm">
            <RefreshCw className="w-4 h-4 text-customs-ink-secondary" aria-hidden="true" />
            Re-run AI
          </Button>
          <Button type="button" variant="outline" size="sm" className="bg-customs-surface-base hover:bg-customs-surface-container text-customs-ink-primary font-headline-sm text-headline-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Log
          </Button>
          <Button type="button" size="sm" className="bg-customs-primary hover:bg-customs-surface-container-low text-customs-on-primary-container font-headline-sm text-headline-sm shadow-md transition-all active:scale-[0.98]">
            <Play className="w-4 h-4" aria-hidden="true" />
            Start review
          </Button>
        </div>
      </div>

      {/* Document intake tray */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DOCUMENTS.map((doc) => {
          const StatusIcon = doc.icon;
          return (
            <div
              key={doc.name}
              className="bg-customs-surface-raised rounded-xl shadow-sm p-4 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden"
              style={{ borderTopWidth: 3, borderTopStyle: "solid", borderTopColor: doc.variant === "confirmed" ? "hsl(var(--customs-status-confirmed-text))" : doc.variant === "error" ? "hsl(var(--customs-status-error-text))" : "hsl(var(--customs-primary))" }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm">
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-customs-ink-primary">{doc.name}</h3>
                      <p className="font-label-code-sm text-label-code-sm text-customs-ink-muted">{doc.file}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    doc.variant === "confirmed"
                      ? "bg-customs-status-confirmed-bg text-customs-status-confirmed-text"
                      : doc.variant === "error"
                        ? "bg-customs-status-error-bg text-customs-status-error-text"
                        : "bg-customs-status-progress-bg text-customs-status-progress-text"
                  } font-label-code-sm text-label-code-sm font-semibold`}>
                    {doc.progress !== null ? (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          doc.variant === "progress" ? "bg-customs-status-progress-text animate-ping" : "bg-customs-status-confirmed-text"
                        }`}></span>
                        {doc.status}
                      </>
                    ) : (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          doc.variant === "error" ? "bg-customs-status-error-text" : "bg-customs-status-confirmed-text"
                        }`}></span>
                        {doc.status}
                      </>
                    )}
                  </span>
                </div>

                {doc.alert && (
                  <div className="bg-customs-status-error-bg/60 rounded-lg p-2 flex items-start gap-2 mt-1">
                    <AlertTriangle className="w-4 h-4 text-customs-status-error-text shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-customs-status-error-text">{doc.alert}</span>
                      <p className="font-body-sm text-body-sm text-customs-on-surface-variant leading-snug">{doc.alertText}</p>
                    </div>
                  </div>
                )}

                {doc.progress !== null && (
                  <div className="bg-customs-surface-base rounded-lg p-2 flex flex-col gap-2 mt-1">
                    <div className="flex items-center justify-between text-caption font-caption">
                      <span className="text-customs-ink-secondary">{doc.reading}</span>
                      <span className="font-label-code-sm text-label-code-sm font-bold text-customs-primary">{doc.progress}%</span>
                    </div>
                    <div className="w-full bg-customs-surface-container rounded-full h-1.5 overflow-hidden">
                      <div className={`bg-customs-primary-container h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${doc.progress}%` }}></div>
                    </div>
                    <span className="font-label-code-sm text-label-code-sm text-customs-ink-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {doc.remaining}
                    </span>
                  </div>
                )}

                {!doc.alert && doc.progress === null && (
                  <div className="bg-customs-surface-base rounded-lg p-2 flex flex-col gap-1.5 mt-1 font-label-code-sm text-label-code-sm">
                    <div className="flex items-center justify-between text-customs-ink-secondary">
                      <span>Extracted Fields</span>
                      <span className="font-semibold text-customs-ink-primary">{doc.fields}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex flex-col">
                        <span className="text-caption font-caption text-customs-ink-muted">Total Declared</span>
                        <span className="font-semibold text-customs-ink-primary">{doc.declared}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-caption font-caption text-customs-ink-muted">HSN Identified</span>
                        <span className="font-semibold text-customs-primary">{doc.hsns}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-2 flex items-center justify-between gap-2">
                {doc.actions?.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      action.variant === "error"
                        ? "bg-customs-status-error-bg hover:bg-customs-status-error-bg/90 text-customs-status-error-text"
                        : "bg-customs-surface-base hover:bg-customs-surface-container text-customs-ink-primary"
                    }`}
                  >
                    <action.icon className="w-3 h-3" aria-hidden="true" />
                    {action.label}
                    {action.hint && (
                      <span className="text-customs-ink-muted font-caption text-caption ml-1">{action.hint}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-6 mt-8">
        <div className="flex items-center p-1 rounded-full bg-customs-surface-raised shadow-sm" id="tab-nav">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-1.5 rounded-full font-headline-sm text-headline-sm transition-all ${
              activeTab === "overview"
                ? "bg-customs-primary-container text-customs-on-primary-container shadow-sm"
                : "text-customs-on-surface-variant hover:text-customs-ink-primary"
            }`}
          >
            <Table className="w-5 h-5" aria-hidden="true" />
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-6 py-1.5 rounded-full font-headline-sm text-headline-sm transition-all ${
              activeTab === "history"
                ? "bg-customs-primary-container text-customs-on-primary-container shadow-sm"
                : "text-customs-on-surface-variant hover:text-customs-ink-primary"
            }`}
          >
            <History className="w-5 h-5" aria-hidden="true" />
            Edit history
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ocr")}
            className={`px-6 py-1.5 rounded-full font-headline-sm text-headline-sm hidden sm:flex transition-all ${
              activeTab === "ocr"
                ? "bg-customs-primary-container text-customs-on-primary-container shadow-sm"
                : "text-customs-on-surface-variant hover:text-customs-ink-primary"
            }`}
          >
            <Code className="w-5 h-5" aria-hidden="true" />
            Raw OCR JSON
          </button>
        </div>
        <div className="flex items-center gap-3 text-customs-ink-secondary font-caption text-caption">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-customs-status-confirmed-text"></span> Matched
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-customs-status-error-text"></span> Discrepancy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-customs-status-review-text"></span> Needs Audit
          </span>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-col gap-8 mt-4">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-customs-surface-raised rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-customs-surface-base flex items-center justify-center text-customs-primary">
                      <Table className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-customs-ink-primary">Reconciled Customs Values & Mapping</h2>
                      <p className="font-caption text-caption text-customs-ink-muted">Cross-document verification across Invoice, BOL, and Packing List</p>
                    </div>
                  </div>
                  <span className="font-label-code-sm text-label-code-sm text-customs-ink-muted">Standard 3-Way Audit</span>
                </div>
                <div className="overflow-x-auto rounded-lg">
                  <table className="w-full text-left font-body-md text-body-md">
                    <thead>
                      <tr className="bg-customs-surface-base text-customs-ink-secondary font-caption text-caption uppercase tracking-wider">
                        <th className="py-2.5 px-3 rounded-l-lg font-semibold">Customs Field</th>
                        <th className="py-2.5 px-3 font-semibold">Comm. Invoice</th>
                        <th className="py-2.5 px-3 font-semibold">Bill of Lading</th>
                        <th className="py-2.5 px-3 font-semibold">Packing List</th>
                        <th className="py-2.5 px-3 rounded-r-lg font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-customs-border-hairline">
                      {RECONCILIATION_ROWS.map((row) => (
                        <tr key={row.field} className={row.status === "error" ? "bg-customs-status-error-bg/30 hover:bg-customs-status-error-bg/40 transition-colors" : "hover:bg-customs-surface-base transition-colors"}>
                          <td className="py-3 px-3 font-headline-sm text-headline-sm text-customs-ink-primary">{row.field}</td>
                          <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-customs-ink-primary">{row.invoice}</td>
                          <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-customs-ink-primary">{row.bol}</td>
                          <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-customs-ink-secondary">{row.packing}</td>
                          <td className="py-3 px-3 text-right">
                            <StatusBadge variant={row.status} label={row.statusLabel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 rounded-lg bg-customs-surface-base flex flex-wrap items-center justify-between gap-3 text-customs-ink-secondary font-caption text-caption">
                  <span className="flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-customs-primary" aria-hidden="true" />
                    Automated reconciliation match confidence score:
                    <strong className="font-label-code-sm text-label-code-sm text-customs-ink-primary font-bold">84.2%</strong>
                  </span>
                  <button className="text-customs-primary hover:underline font-headline-sm text-headline-sm text-sm" type="button">
                    Configure Validation Rules →
                  </button>
                </div>
              </div>
              <div className="lg:col-span-5 bg-customs-surface-raised rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-customs-status-review-bg flex items-center justify-center text-customs-status-review-text">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-customs-ink-primary">Compliance Action Items</h2>
                      <p className="font-caption text-caption text-customs-ink-muted">3 required resolutions before clearance filing</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-customs-status-error-bg text-customs-status-error-text font-label-code-sm text-label-code-sm font-bold uppercase">Urgent</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      priority: "High Priority",
                      title: "Packing List unparsed",
                      id: "PKL-01",
                      idVariant: "error" as const,
                      text: "Document OCR failed on 4 pallet line items. Gross weight cannot be authenticated against BOL #AX-7720.",
                      field: "Field: Pallet Weight / Dimensions",
                      action: "Resolve Field",
                    },
                    {
                      priority: "Medium",
                      title: "HSN 8471.30 Confidence 78%",
                      id: "TAR-04",
                      idVariant: "review" as const,
                      text: "Description suggests \"Automatic Data Processing Unit &lt; 10kg\". Suggested DGFT sub-heading is 8471.30.10.",
                      action: "Confirm HSN",
                    },
                    {
                      priority: "Low",
                      title: "Consignee punctuation variance",
                      id: "TXT-12",
                      idVariant: "neutral" as const,
                      text: "\"Apex Logistics India Pvt Ltd\" on Invoice vs \"Apex Logistics India Ltd.\" on Bill of Lading. GSTIN matches precisely.",
                      gstinVerified: true,
                      action: "Ignore Variance",
                    },
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-xl flex flex-col gap-2 transition-all hover:bg-customs-surface-container-low/50 ${
                      item.priority === "High Priority"
                        ? "bg-customs-status-error-bg/30"
                        : item.priority === "Medium"
                          ? "bg-customs-status-review-bg/30"
                          : "bg-customs-surface-base"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded bg-customs-surface-container text-customs-ink-secondary font-label-code-sm text-label-code-sm font-bold uppercase text-[10px]`}>
                            {item.priority}
                          </span>
                          <span className="font-headline-sm text-headline-sm text-customs-ink-primary">{item.title}</span>
                        </div>
                        <span className={`font-label-code-sm text-label-code-sm font-semibold ${
                          item.idVariant === "error"
                            ? "text-customs-status-error-text"
                            : item.idVariant === "review"
                              ? "text-customs-status-review-text"
                              : "text-customs-ink-muted"
                        }`}>{item.id}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-customs-ink-secondary">{item.text}</p>
                      <div className="flex items-center justify-between pt-1">
                        {item.gstinVerified ? (
                          <span className="font-caption text-caption text-customs-status-confirmed-text flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            GSTIN verified
                          </span>
                        ) : (
                          <button className="font-caption text-caption text-customs-primary hover:underline" type="button">
                            View DGFT Tariff Schedule
                          </button>
                        )}
                        <button
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            item.action === "Resolve Field"
                              ? "bg-customs-primary hover:bg-customs-surface-container-low text-customs-on-primary-container shadow-sm"
                              : item.action === "Confirm HSN"
                                ? "bg-customs-surface-raised hover:bg-customs-surface-base text-customs-ink-primary shadow-sm"
                                : "bg-customs-surface-raised text-customs-ink-secondary hover:text-customs-ink-primary shadow-sm"
                          }`}
                        >
                          {item.action === "Resolve Field" && <CheckCircle2 className="w-3 h-3 text-customs-on-primary-container" aria-hidden="true" />}
                          {item.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carrier routing metrics */}
            <div className="bg-customs-surface-raised rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-customs-primary">flight_takeoff</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-customs-ink-primary">Carrier Routing & Modality Manifest</h3>
                </div>
                <span className="font-label-code-sm text-label-code-sm text-customs-ink-muted">Flight: SQ-7911 (Charter)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { label: "Origin Hub", value: "Shanghai Pudong (PVG)", meta: "Terminal 3 Cargo Bay 18" },
                  { label: "Destination Customs", value: "Nhava Sheva Air Complex", meta: "Gate 4 ACC Inbound" },
                  { label: "Declared Weight Total", value: "18,400.00 KG", meta: "Pending Packing List tare check", metaVariant: "review" as const },
                  { label: "Customs Broker License", value: "CB-IN-88912-A", meta: "Clearance Agent Assigned", metaVariant: "confirmed" as const },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-customs-surface-base flex flex-col">
                    <span className="font-caption text-caption text-customs-ink-muted uppercase">{item.label}</span>
                    <span className="font-label-code-md text-label-code-md text-customs-ink-primary font-bold">{item.value}</span>
                    <span className={`font-caption text-caption text-customs-ink-secondary ${
                      item.metaVariant === "review" ? "text-customs-status-review-text font-medium" : item.metaVariant === "confirmed" ? "text-customs-status-confirmed-text font-medium" : ""
                    }`}>{item.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="bg-customs-surface-raised rounded-xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-customs-primary-fixed flex items-center justify-center text-customs-primary">
                  <History className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-customs-ink-primary">Audit Trail & Field Edit History</h2>
                  <p className="font-caption text-caption text-customs-ink-muted">Immutable log of operator overrides, OCR corrections, and DGFT API syncs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm">
                  <Sliders className="w-4 h-4" aria-hidden="true" />
                  Filter User
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-left font-body-md text-body-md">
                <thead>
                  <tr className="bg-customs-surface-base text-customs-ink-secondary font-caption text-caption uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg font-semibold">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3 font-semibold">Actor / Role</th>
                    <th className="py-2.5 px-3 font-semibold">Field Affected</th>
                    <th className="py-2.5 px-3 font-semibold">Original Value</th>
                    <th className="py-2.5 px-3 font-semibold">Reconciled / New Value</th>
                    <th className="py-2.5 px-3 rounded-r-lg font-semibold">Audit Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customs-border-hairline">
                  {AUDIT_ROWS.map((row) => (
                    <tr key={row.ts} className="hover:bg-customs-surface-base transition-colors">
                      <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-customs-ink-secondary whitespace-nowrap">{row.ts}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-customs-primary flex items-center justify-center text-customs-on-primary text-[11px] font-bold">
                            {row.actor.charAt(0).toUpperCase()}{row.actor.split(".").pop()?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-headline-sm text-headline-sm text-customs-ink-primary">{row.actor}</span>
                            <span className="font-caption text-caption text-customs-ink-muted">{row.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-label-code-sm text-label-code-sm font-semibold text-customs-ink-primary">{row.field}</td>
                      <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-customs-status-error-text"><del>{row.from}</del></td>
                      <td className="py-3 px-3 font-label-code-sm text-label-code-sm font-bold text-customs-ink-primary">{row.to}</td>
                      <td className="py-3 px-3 font-caption text-caption text-customs-ink-secondary">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ocr" && (
          <div className="bg-customs-surface-raised rounded-xl shadow-sm p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-customs-primary" aria-hidden="true" />
                <h3 className="font-headline-sm text-headline-sm text-customs-ink-primary">Parser Payload Output</h3>
              </div>
              <span className="font-label-code-sm text-label-code-sm text-customs-ink-muted">JSON Schema v2.1</span>
            </div>
            <pre className="bg-customs-surface-base p-4 rounded-lg font-label-code-sm text-label-code-sm text-customs-ink-primary overflow-x-auto leading-relaxed">
              {JSON.stringify(
                {
                  shipment_id: shipment.shipment_number,
                  consignee: {
                    name: supplierName(shipment.suppliers) || "Apex Logistics India Pvt Ltd",
                    gstin: "27AAAC19241Q1",
                    status: "dgft_verified",
                  },
                  customs_declaration: {
                    currency: "USD",
                    total_fob: 142850.00,
                    gross_weight_kg: 18400.00,
                    status: "needs_review",
                    pending_docs: ["Packing List"],
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
