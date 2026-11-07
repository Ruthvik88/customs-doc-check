"use strict";

/**
 * CSV helpers for the filing-software import layout (see docs/export-layout.md).
 * Pure functions -- easy to unit test without a database.
 */

/** Escape a CSV field per RFC 4180. */
export function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\r\n]/.test(s) || /^\s|\s$/.test(s)) {
    return `"${String(s).replace(/"/g, '""')}"`;
  }
  return s;
}

export const EXPORT_COLUMNS = [
  "shipment_number",
  "supplier",
  "consignee",
  "invoice_number",
  "invoice_date",
  "currency",
  "incoterm",
  "invoice_total",
  "packages",
  "gross_weight_kg",
  "net_weight_kg",
  "containers",
  "bl_number",
  "vessel",
  "port_of_loading",
  "port_of_discharge",
] as const;

export function buildExportRow(shipment: {
  shipment_number: string;
  suppliers?: { name: string | null } | null;
  invoice_number: string | null;
  invoice_date: string | null;
  currency: string | null;
  incoterm: string | null;
  total_packages: number | null;
  gross_weight_kg: number | null;
  net_weight_kg: number | null;
  containers: string[] | null;
  bl_number: string | null;
  vessel: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
}, fieldByKey: Record<string, string>): string[] {
  const containers = Array.isArray(shipment.containers) ? shipment.containers.join(", ") : "";
  return [
    shipment.shipment_number,
    shipment.suppliers?.name ?? "",
    fieldByKey["consignee"] ?? "",
    shipment.invoice_number ?? "",
    shipment.invoice_date ?? "",
    shipment.currency ?? "",
    shipment.incoterm ?? "",
    fieldByKey["invoice_total"] ?? "",
    shipment.total_packages ?? "",
    shipment.gross_weight_kg ?? "",
    shipment.net_weight_kg ?? "",
    containers,
    shipment.bl_number ?? "",
    shipment.vessel ?? "",
    shipment.port_of_loading ?? "",
    shipment.port_of_discharge ?? "",
  ];
}

export function buildCsv(columns: string[], rows: string[][]): string {
  return [columns.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\r\n") + "\r\n";
}
