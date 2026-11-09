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
  "description",
  "hsn",
  "qty",
  "unit_price",
  "line_total",
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
}, fieldByKey: Record<string, string>, lineItem: {
  description: string | null;
  hsn: string | null;
  qty: number | null;
  unit_price: number | null;
  line_total: number | null;
} = { description: null, hsn: null, qty: null, unit_price: null, line_total: null }): string[] {
  const field = (key: string) => fieldByKey[key] ?? "";
  const value = (key: string, shipmentValue: string | number | null) =>
    shipmentValue != null ? String(shipmentValue) : field(key);
  const containers = Array.isArray(shipment.containers)
    ? shipment.containers.join(", ")
    : field("containers");
  return [
    shipment.shipment_number,
    shipment.suppliers?.name ?? field("supplier"),
    field("consignee"),
    value("invoice_number", shipment.invoice_number),
    value("invoice_date", shipment.invoice_date),
    value("currency", shipment.currency),
    value("incoterm", shipment.incoterm),
    field("invoice_total"),
    value("packages", shipment.total_packages),
    value("gross_weight_kg", shipment.gross_weight_kg),
    value("net_weight_kg", shipment.net_weight_kg),
    containers,
    value("bl_number", shipment.bl_number),
    value("vessel", shipment.vessel),
    value("port_of_loading", shipment.port_of_loading),
    value("port_of_discharge", shipment.port_of_discharge),
    lineItem.description ?? "",
    lineItem.hsn ?? "",
    lineItem.qty == null ? "" : String(lineItem.qty),
    lineItem.unit_price == null ? "" : String(lineItem.unit_price),
    lineItem.line_total == null ? "" : String(lineItem.line_total),
  ];
}

export function buildCsv(columns: readonly string[], rows: readonly string[][]): string {
  return [columns.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\r\n") + "\r\n";
}
