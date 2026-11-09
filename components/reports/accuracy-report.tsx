"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  Anchor,
  ArrowRight,
  Badge,
  Barcode,
  BarChart3,
  Building,
  Edit,
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
      <div className="w-full max-w-7xl mx-auto px-p-6 py-8 flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 font-label-code text-label-code-sm text-customs-ink-muted uppercase tracking-wider">
            <span>CUSTOMS VERIFICATION ENGINE</span>
            <span>/</span>
            <span className="text-customs-secondary font-semibold">METRICS EVALUATION</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-headline-xl text-customs-ink-primary tracking-tight">
                Accuracy Report
              </h1>
              <p className="font-body text-body-md text-customs-ink-secondary mt-1">
                Extraction precision computed from completed document reviews and
                manual field corrections.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-customs-surface-raised px-4 py-1 rounded-lg shadow-sm">
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
              className="flex items-center gap-1 px-4 py-2 rounded-md bg-customs-surface-raised text-customs-primary font-headline-sm text-headline-sm shadow-sm transition-colors" role="tab" type="button"
            >
              <Icon as={Table} size={16} aria-hidden="true" />
              <span>By field</span>
            </button>
            <button
              aria-selected="false"
              className="flex items-center gap-1 px-4 py-2 rounded-md text-customs-on-surface-variant hover:text-customs-on-surface font-headline-sm text-headline-sm transition-colors" role="tab" type="button"
            >
              <Icon as={Building} size={16} aria-hidden="true" />
              <span>By supplier</span>
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-customs-ink-muted font-label-code text-label-code-sm">
            <Icon as={Info} size={16} aria-hidden="true" />
          </div>
        </div>

        {/* Empty state */}
        <div className="w-full bg-customs-surface-raised rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[460px]">
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-customs-surface-container flex items-center justify-center text-customs-primary shadow-sm mb-p-6 relative">
              <Icon as={Table} size={20} aria-hidden="true" />
            </div>
            <h2 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight mb-p-2">
              No reviews yet
            </h2>
            <p className="font-body text-body-md text-customs-ink-secondary leading-relaxed mb-p-8 max-w-md">
              Accuracy metrics will appear here once operators complete document
              reviews and confirm or correct extracted fields.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2 bg-customs-primary-container text-customs-on-primary-container font-headline-sm text-headline-sm rounded-lg hover:bg-customs-primary transition-colors shadow-sm"
            >
              <Icon as={Truck} size={16} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              <span>Go to Shipments</span>
              <Icon as={ArrowRight} size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <div className="mt-p-8 flex items-center gap-4 text-customs-ink-muted font-caption text-caption">
              <div className="flex items-center gap-1">
                <Icon as={FileText} size={16} className="text-customs-ink-muted" aria-hidden="true" />
                <span>Commercial Invoices</span>
              </div>
              <span className="text-customs-border-hairline">•</span>
              <div className="flex items-center gap-1">
                <Icon as={Package} size={16} className="text-customs-ink-muted" aria-hidden="true" />
                <span>Packing Lists</span>
              </div>
              <span className="text-customs-border-hairline">•</span>
              <div className="flex items-center gap-1">
                <Icon as={Truck} size={16} className="text-customs-ink-muted" aria-hidden="true" />
                <span>Bills of Lading</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-p-6 py-8">
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-p-6">
        <div className="flex items-center gap-1 text-customs-ink-muted font-label-code text-label-code-sm uppercase tracking-wider">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-p-4">
        <div aria-label="Accuracy Breakdown View" className="inline-flex p-1 bg-customs-surface-container rounded-xl gap-1" role="tablist">
          <button
            aria-controls="panel-fields"
            aria-selected={activeTab === "fields"}
            id="tab-btn-fields"
            className={`relative px-6 py-1.5 rounded-lg font-headline-sm text-headline-sm transition-colors duration-200 flex items-center gap-1 ${
              activeTab === "fields"
                ? "bg-customs-surface-raised text-customs-primary shadow-sm"
                : "text-customs-ink-secondary hover:text-customs-ink-primary hover:bg-customs-surface-raised/50"
            }`}
            onClick={() => setActiveTab("fields")}
            role="tab"
            type="button"
          >
            <Icon as={Table} size={16} aria-hidden="true" />
            <span>By field</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-ink-secondary font-label-code text-label-code-sm">
              {byField.length}
            </span>
          </button>
          <button
            aria-controls="panel-suppliers"
            aria-selected={activeTab === "suppliers"}
            id="tab-btn-suppliers"
            className={`relative px-6 py-1.5 rounded-lg font-headline-sm text-headline-sm transition-colors duration-200 flex items-center gap-1 ${
              activeTab === "suppliers"
                ? "bg-customs-surface-raised text-customs-primary shadow-sm"
                : "text-customs-ink-secondary hover:text-customs-ink-primary hover:bg-customs-surface-raised/50"
            }`}
            onClick={() => setActiveTab("suppliers")}
            role="tab"
            type="button"
          >
            <Icon as={Building} size={16} aria-hidden="true" />
            <span>By supplier</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-customs-surface-container-high text-customs-ink-secondary font-label-code text-label-code-sm">
              {bySupplier.length}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-customs-ink-secondary font-caption text-caption">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-customs-surface-raised shadow-sm font-label-code text-label-code-sm text-customs-ink-secondary">
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
                <th className="py-2.5 px-6 font-semibold w-2/5" scope="col">
                  Field Name
                </th>
                <th className="py-2.5 px-6 font-semibold text-right w-1/5" scope="col">
                  Times reviewed
                </th>
                <th className="py-2.5 px-6 font-semibold text-right w-1/5" scope="col">
                  Times corrected
                </th>
                <th className="py-2.5 px-6 font-semibold text-right w-1/5" scope="col">
                  Accuracy rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent font-body text-body-md text-customs-ink-primary">
              {activeTab === "fields" ? (
                byField.map((stat) => {
                  const fieldIcon = FIELD_ICONS[stat.key] ?? Scale;
                  const tone = accuracyTone(stat.accuracy);
                  return (
                    <tr key={stat.key} className="h-14 transition-colors hover:bg-customs-surface-container-low group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-customs-surface-container flex items-center justify-center text-customs-secondary">
                            <Icon as={fieldIcon} size={16} aria-hidden="true" />
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
                      <td className="py-3 px-6 text-right font-label-code text-label-code-md text-customs-ink-secondary">
                        {stat.total}
                      </td>
                      <td className="py-3 px-6 text-right font-label-code text-label-code-md {editedTone(stat.edited, stat.accuracy)}">
                        {stat.edited}
                      </td>
                      <td className="py-3 px-6">
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
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-customs-surface-container flex items-center justify-center text-customs-secondary">
                            <Icon as={Building} size={16} aria-hidden="true" />
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
                      <td className="py-3 px-6 text-right font-label-code text-label-code-md text-customs-ink-secondary">
                        {stat.total}
                      </td>
                      <td className="py-3 px-6 text-right font-label-code text-label-code-md {editedTone(stat.edited, stat.accuracy)}">
                        {stat.edited}
                      </td>
                      <td className="py-3 px-6">
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
        <div className="bg-customs-surface-base px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-customs-ink-secondary font-caption text-caption">
          <div className="flex items-center gap-1">
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

