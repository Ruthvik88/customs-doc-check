"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Badge,
  Barcode,
  Building,
  FileText,
  Info,
  Package,
  Scale,
  Table,
  Tag,
  Truck,
} from "lucide-react";

type FieldStat = {
  key: string;
  label: string;
  context: string;
  total: number;
  edited: number;
  accuracy: number | null;
};

type SupplierStat = {
  name: string;
  total: number;
  edited: number;
  accuracy: number | null;
};

const FIELD_ICONS: Record<string, typeof Scale> = {
  gross_weight_kg: Scale,
  hs_code: Tag,
  consignee_name: Badge,
  invoice_number: FileText,
  consignee_gstin: Barcode,
  port_route: Anchor,
  invoice_total: FileText,
  incoterms: FileText,
  net_weight_kg: Scale,
  item_description: FileText,
};

function accuracyTone(accuracy: number | null) {
  if (accuracy == null) {
    return { text: "text-customs-ink-secondary", bar: "bg-customs-surface-container-high" };
  }
  if (accuracy >= 99) {
    return { text: "text-customs-status-confirmed-text", bar: "bg-customs-status-confirmed-text" };
  }
  if (accuracy >= 95) {
    return { text: "text-customs-ink-primary", bar: "bg-customs-primary-container" };
  }
  return { text: "text-customs-status-review-text", bar: "bg-customs-status-review-text" };
}

function editedTone(edited: number, accuracy: number | null) {
  if (edited > 0 && accuracy != null && accuracy < 95) {
    return "text-customs-status-review-text font-semibold";
  }
  return "text-customs-ink-secondary";
}

export function AccuracyReport({
  byField,
  bySupplier,
  totalReviewed,
  totalEdited,
}: {
  byField: FieldStat[];
  bySupplier: SupplierStat[];
  totalReviewed: number;
  totalEdited: number;
}) {
  const [activeTab, setActiveTab] = useState<"fields" | "suppliers">("fields");

  const rows = activeTab === "fields" ? byField : bySupplier;
  const isEmpty = totalReviewed === 0;

  const accuracyLabel = (stat: FieldStat | SupplierStat) =>
    stat.accuracy === null ? "—" : `${stat.accuracy}%`;

  if (isEmpty) {
    return (
      <div className="w-full max-w-7xl mx-auto px-gutter-desktop py-space-xl flex flex-col gap-space-lg">
        {/* Page header */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs font-label-code text-label-code-sm text-customs-ink-muted uppercase tracking-wider">
            <span>CUSTOMS VERIFICATION ENGINE</span>
            <span>/</span>
            <span className="text-customs-secondary font-semibold">METRICS EVALUATION</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <h1 className="font-headline text-headline-xl text-customs-ink-primary tracking-tight">
                Accuracy Report
              </h1>
              <p className="font-body text-body-md text-customs-ink-secondary mt-1">
                Extraction precision computed from completed document reviews and
                manual field corrections.
              </p>
            </div>
            <div className="flex items-center gap-space-sm bg-customs-surface-raised px-space-md py-space-xs rounded-lg shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-customs-status-review-text animate-pulse" aria-hidden="true" />
              <span className="font-label-code text-label-code-sm text-customs-ink-secondary uppercase tracking-wider">
                Awaiting Initial Feedback Loop
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher (informational in empty state) */}
        <div className="flex items-center justify-between">
          <div aria-label="Accuracy aggregation levels" className="flex p-1 bg-customs-surface-container rounded-lg" role="tablist">
            <button
              aria-selected="true"
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-md bg-customs-surface-raised text-customs-primary font-headline-sm text-headline-sm shadow-sm transition-colors" role="tab" type="button"
            >
              <Table className="text-[18px]" aria-hidden="true" />
              <span>By field</span>
            </button>
            <button
              aria-selected="false"
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-md text-customs-on-surface-variant hover:text-customs-on-surface font-headline-sm text-headline-sm transition-colors" role="tab" type="button"
            >
              <Building className="text-[18px]" aria-hidden="true" />
              <span>By supplier</span>
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-space-xs text-customs-ink-muted font-label-code text-label-code-sm">
            <Info className="text-[16px]" aria-hidden="true" />
            <span>Confidence threshold: 99.4% standard</span>
          </div>
        </div>

        {/* Empty state */}
        <div className="w-full bg-customs-surface-raised rounded-xl shadow-sm p-space-xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[460px]">
          <div className="absolute w-96 h-96 rounded-full bg-customs-primary/5 blur-3xl pointer-events-none -top-20" />
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-customs-surface-container flex items-center justify-center text-customs-primary shadow-sm mb-space-lg relative">
              <svg className="w-10 h-10 text-customs-primary" fill="none" viewBox="0 0 40 40" aria-hidden="true">
                <rect className="fill-customs-surface-base" height="24" rx="4" width="28" x="6" y="8" />
                <path d="M12 15H22" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
                <path d="M12 21H18" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
                <path d="M12 27H24" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
                <circle className="stroke-customs-primary" cx="27" cy="22" r="5" stroke-dasharray="2 2" stroke-width="2" />
                <circle className="fill-customs-primary" cx="27" cy="22" r="2" />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-customs-surface-raised shadow-sm flex items-center justify-center text-customs-ink-muted">
                <Info className="text-[14px]" aria-hidden="true" />
              </div>
            </div>
            <span className="font-label-code text-label-code-sm uppercase tracking-wider text-customs-ink-muted mb-space-xs">
              Evaluation Queue Standby
            </span>
            <h2 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight mb-space-sm">
              No reviews yet
            </h2>
            <p className="font-body text-body-md text-customs-ink-secondary leading-relaxed mb-space-xl max-w-md">
              Accuracy metrics will appear here once operators complete document
              reviews and confirm or correct extracted fields.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-space-sm px-space-lg py-space-sm bg-customs-primary-container text-customs-on-primary-container font-headline-sm text-headline-sm rounded-lg hover:bg-customs-primary transition-colors shadow-sm"
            >
              <Truck className="text-[20px] transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              <span>Go to Shipments</span>
              <ArrowRight className="text-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <div className="mt-space-xl flex items-center gap-space-md text-customs-ink-muted font-caption text-caption">
              <div className="flex items-center gap-1">
                <FileText className="text-[14px] text-customs-ink-muted" aria-hidden="true" />
                <span>Commercial Invoices</span>
              </div>
              <span className="text-customs-border-hairline">•</span>
              <div className="flex items-center gap-1">
                <Package className="text-[14px] text-customs-ink-muted" aria-hidden="true" />
                <span>Packing Lists</span>
              </div>
              <span className="text-customs-border-hairline">•</span>
              <div className="flex items-center gap-1">
                <Truck className="text-[14px] text-customs-ink-muted" aria-hidden="true" />
                <span>Bills of Lading</span>
              </div>
            </div>
          </div>
          {/* Supplementary guidance cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md w-full mt-space-xl">
            <div className="bg-customs-surface-raised p-space-md rounded-lg shadow-sm flex items-start gap-space-md">
              <div className="w-8 h-8 rounded bg-customs-surface-container flex items-center justify-center text-customs-ink-secondary flex-shrink-0">
                <FileText className="text-[18px]" aria-hidden="true" />
              </div>
              <div>
                <span className="font-label-code text-label-code-sm uppercase tracking-wider text-customs-ink-muted block">Step 01</span>
                <h3 className="font-headline text-headline-sm text-customs-ink-primary mt-0.5">Inspect Discrepancies</h3>
                <p className="font-body text-body-sm text-customs-ink-secondary mt-1">
                  Compare original bill scans with extracted table items in split-screen.
                </p>
              </div>
            </div>
            <div className="bg-customs-surface-raised p-space-md rounded-lg shadow-sm flex items-start gap-space-md">
              <div className="w-8 h-8 rounded bg-customs-surface-container flex items-center justify-center text-customs-ink-secondary flex-shrink-0">
                <EditIcon className="text-[18px]" aria-hidden="true" />
              </div>
              <div>
                <span className="font-label-code text-label-code-sm uppercase tracking-wider text-customs-ink-muted block">Step 02</span>
                <h3 className="font-headline text-headline-sm text-customs-ink-primary mt-0.5">Confirm or Correct</h3>
                <p className="font-body text-body-sm text-customs-ink-secondary mt-1">
                  Manual overrides update HSN codes, declared values, and net weights.
                </p>
              </div>
            </div>
            <div className="bg-customs-surface-raised p-space-md rounded-lg shadow-sm flex items-start gap-space-md">
              <div className="w-8 h-8 rounded bg-customs-surface-container flex items-center justify-center text-customs-ink-secondary flex-shrink-0">
                <BarChart3 className="text-[18px]" aria-hidden="true" />
              </div>
              <div>
                <span className="font-label-code text-label-code-sm uppercase tracking-wider text-customs-ink-muted block">Step 03</span>
                <h3 className="font-headline text-headline-sm text-customs-ink-primary mt-0.5">Generate Benchmarks</h3>
                <p className="font-body text-body-sm text-customs-ink-secondary mt-1">
                  Accuracy scores populate per entity to spotlight automation quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-gutter-desktop py-space-xl">
      {/* Page header */}
      <div className="flex flex-col gap-space-xs mb-space-lg">
        <div className="flex items-center gap-space-xs text-customs-ink-muted font-label-code text-label-code-sm uppercase tracking-wider">
          <span>Analytics</span>
          <span>/</span>
          <span className="text-customs-secondary font-semibold">Extraction Metrics</span>
        </div>
        <h1 className="font-headline text-headline-xl text-customs-ink-primary tracking-tight">
          Accuracy Report
        </h1>
        <p className="font-body text-body-md text-customs-ink-secondary max-w-2xl">
          Extraction precision computed from completed document reviews and manual
          field corrections.
        </p>
      </div>

      {/* Tabs + context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-md">
        <div aria-label="Accuracy Breakdown View" className="inline-flex p-1 bg-customs-surface-container rounded-xl gap-1" role="tablist">
          <button
            aria-controls="panel-fields"
            aria-selected={activeTab === "fields"}
            id="tab-btn-fields"
            className={`relative px-space-lg py-1.5 rounded-lg font-headline-sm text-headline-sm transition-colors duration-200 flex items-center gap-space-xs ${
              activeTab === "fields"
                ? "bg-customs-surface-raised text-customs-primary shadow-sm"
                : "text-customs-ink-secondary hover:text-customs-ink-primary hover:bg-customs-surface-raised/50"
            }`}
            onClick={() => setActiveTab("fields")}
            role="tab"
            type="button"
          >
            <Table className="text-[18px]" aria-hidden="true" />
            <span>By field</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-ink-secondary font-label-code text-label-code-sm">
              {byField.length}
            </span>
          </button>
          <button
            aria-controls="panel-suppliers"
            aria-selected={activeTab === "suppliers"}
            id="tab-btn-suppliers"
            className={`relative px-space-lg py-1.5 rounded-lg font-headline-sm text-headline-sm transition-colors duration-200 flex items-center gap-space-xs ${
              activeTab === "suppliers"
                ? "bg-customs-surface-raised text-customs-primary shadow-sm"
                : "text-customs-ink-secondary hover:text-customs-ink-primary hover:bg-customs-surface-raised/50"
            }`}
            onClick={() => setActiveTab("suppliers")}
            role="tab"
            type="button"
          >
            <Building className="text-[18px]" aria-hidden="true" />
            <span>By supplier</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-ink-secondary font-label-code text-label-code-sm">
              {bySupplier.length}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-space-sm text-customs-ink-secondary font-caption text-caption">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-customs-surface-raised shadow-sm font-label-code text-label-code-sm text-customs-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-customs-status-confirmed-text" aria-hidden="true" />
            Baseline: 100% - (Corrected / Reviewed)
          </span>
        </div>
      </div>

      <div className="w-full bg-customs-surface-raised rounded-xl shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto" id={activeTab === "fields" ? "panel-fields" : "panel-suppliers"} role="tabpanel">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-customs-surface-base h-9 text-customs-ink-secondary font-caption text-caption uppercase tracking-wider">
                <th className="py-2.5 px-space-lg font-semibold w-2/5" scope="col">
                  Field Name
                </th>
                <th className="py-2.5 px-space-lg font-semibold text-right w-1/5" scope="col">
                  Times reviewed
                </th>
                <th className="py-2.5 px-space-lg font-semibold text-right w-1/5" scope="col">
                  Times corrected
                </th>
                <th className="py-2.5 px-space-lg font-semibold text-right w-1/5" scope="col">
                  Accuracy rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent font-body text-body-md text-customs-ink-primary">
              {activeTab === "fields" ? (
                byField.map((stat) => {
                  const Icon = FIELD_ICONS[stat.key] ?? Scale;
                  const tone = accuracyTone(stat.accuracy);
                  return (
                    <tr key={stat.key} className="h-14 transition-colors hover:bg-customs-surface-container-low group">
                      <td className="py-3 px-space-lg">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-7 h-7 rounded-lg bg-customs-surface-container flex items-center justify-center text-customs-secondary">
                            <Icon className="text-[16px]" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="font-headline-sm text-headline-sm text-customs-ink-primary block leading-snug">
                              {stat.label}
                            </span>
                            <span className="font-caption text-caption text-customs-ink-muted">
                              {stat.context}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-space-lg text-right font-label-code text-label-code-md text-customs-ink-secondary">
                        {stat.total}
                      </td>
                      <td className="py-3 px-space-lg text-right font-label-code text-label-code-md {editedTone(stat.edited, stat.accuracy)}">
                        {stat.edited}
                      </td>
                      <td className="py-3 px-space-lg">
                        <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[160px]">
                          <span className={`font-label-code text-label-code-md font-semibold ${tone.text}`}>
                            {accuracyLabel(stat)}
                          </span>
                          {stat.accuracy !== null && (
                            <div className="w-full h-1 bg-customs-surface-container-highest rounded-full overflow-hidden">
                              <div className={`h-full ${tone.bar} rounded-full`} style={{ width: `${stat.accuracy}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                bySupplier.map((stat) => {
                  const tone = accuracyTone(stat.accuracy);
                  return (
                    <tr key={stat.name} className="h-14 transition-colors hover:bg-customs-surface-container-low group">
                      <td className="py-3 px-space-lg">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-7 h-7 rounded-lg bg-customs-surface-container flex items-center justify-center text-customs-secondary">
                            <Building className="text-[16px]" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="font-headline-sm text-headline-sm text-customs-ink-primary block leading-snug">
                              {stat.name}
                            </span>
                            <span className="font-caption text-caption text-customs-ink-muted">
                              {stat.total} field reviews
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-space-lg text-right font-label-code text-label-code-md text-customs-ink-secondary">
                        {stat.total}
                      </td>
                      <td className="py-3 px-space-lg text-right font-label-code text-label-code-md {editedTone(stat.edited, stat.accuracy)}">
                        {stat.edited}
                      </td>
                      <td className="py-3 px-space-lg">
                        <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[160px]">
                          <span className={`font-label-code text-label-code-md font-semibold ${tone.text}`}>
                            {accuracyLabel(stat)}
                          </span>
                          {stat.accuracy !== null && (
                            <div className="w-full h-1 bg-customs-surface-container-highest rounded-full overflow-hidden">
                              <div className={`h-full ${tone.bar} rounded-full`} style={{ width: `${stat.accuracy}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-customs-surface-base px-space-lg py-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-xs text-customs-ink-secondary font-caption text-caption">
          <div className="flex items-center gap-space-xs">
            <Info className="text-[15px] text-customs-ink-muted" aria-hidden="true" />
            <span id="footer-count-text">
              Showing {rows.length} {activeTab === "fields" ? "fields" : "suppliers"} • Computed across verified shipments
            </span>
          </div>
          <div className="font-label-code text-label-code-sm text-customs-ink-muted">
            All values derived from human clearance confirmation logs
          </div>
        </div>
      </div>
    </div>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
