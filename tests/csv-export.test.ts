import { describe, it, expect } from "vitest";
import { csvEscape, EXPORT_COLUMNS, buildExportRow, buildCsv } from "@/lib/export";

describe("csvEscape", () => {
  it("escapes fields containing commas", () => {
    expect(csvEscape("a, b")).toBe('"a, b"');
  });
  it("escapes fields containing double quotes", () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });
  it("escapes fields with leading/trailing whitespace", () => {
    expect(csvEscape("  pad  ")).toBe('"  pad  "');
  });
  it("does not escape plain values", () => {
    expect(csvEscape("USD")).toBe("USD");
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });
});

describe("EXPORT_COLUMNS", () => {
  it("has the expected 21 columns", () => {
    expect(EXPORT_COLUMNS).toHaveLength(21);
    expect(EXPORT_COLUMNS[0]).toBe("shipment_number");
    expect(EXPORT_COLUMNS[15]).toBe("port_of_discharge");
  });
});

describe("buildExportRow", () => {
  const shipment = {
    shipment_number: "SHP-24812",
    suppliers: { name: "Company C" },
    invoice_number: "INV-SE-3310",
    invoice_date: "2025-10-22",
    currency: "EUR",
    incoterm: "CIF",
    total_packages: 6,
    gross_weight_kg: 1460,
    net_weight_kg: 1420,
    containers: ["CMAU5555552"],
    bl_number: "BL-SE-7741",
    vessel: "MV Baltic Trader",
    port_of_loading: "Gothenburg, Sweden",
    port_of_discharge: "Nhava Sheva, India",
  };

  it("maps reconciled fields and supplier", () => {
    const row = buildExportRow(shipment, { consignee: "Nhava Sheva Imports Pvt. Ltd.", invoice_total: "7650.00" });
    expect(row[0]).toBe("SHP-24812");
    expect(row[1]).toBe("Company C");
    expect(row[2]).toBe("Nhava Sheva Imports Pvt. Ltd.");
    expect(row[3]).toBe("INV-SE-3310");
    expect(row[4]).toBe("2025-10-22");
    expect(row[5]).toBe("EUR");
    expect(row[6]).toBe("CIF");
    expect(row[7]).toBe("7650.00");
    expect(row[8]).toBe("6");
    expect(row[9]).toBe("1460");
    expect(row[10]).toBe("1420");
    expect(row[11]).toBe("CMAU5555552");
    expect(row[12]).toBe("BL-SE-7741");
    expect(row[13]).toBe("MV Baltic Trader");
    expect(row[14]).toBe("Gothenburg, Sweden");
    expect(row[15]).toBe("Nhava Sheva, India");
  });

  it("defaults missing supplier/fields to empty string", () => {
    const row = buildExportRow({ ...shipment, suppliers: null }, {});
    expect(row[1]).toBe("");
    expect(row[2]).toBe("");
  });

  it("exports SHP-24812 with one complete row per sample line item", () => {
    const lineItems = [{ description: "Steel ball valve DN50", hsn: "848180", qty: 180, unit_price: 42.5, line_total: 7650 }];
    const fields = {
      supplier: "Company C", consignee: "Nhava Sheva Imports Pvt. Ltd.", invoice_number: "INV-SE-3310",
      invoice_date: "2025-10-22", currency: "EUR", incoterm: "CIF", invoice_total: "EUR 7650.00",
      packages: "6", gross_weight_kg: "1460", net_weight_kg: "1420", containers: "CMAU5555552",
      bl_number: "BL-SE-7741", vessel: "MV Baltic Trader", port_of_loading: "Gothenburg, Sweden",
      port_of_discharge: "Nhava Sheva, India",
    };
    const sparseShipment = {
      ...shipment, suppliers: null, invoice_number: null, invoice_date: null, currency: null, incoterm: null,
      total_packages: null, gross_weight_kg: null, net_weight_kg: null, containers: null,
      bl_number: null, vessel: null, port_of_loading: null, port_of_discharge: null,
    };
    const rows = lineItems.map((item) => buildExportRow(sparseShipment, fields, item));
    expect(rows).toHaveLength(lineItems.length);
    expect(rows[0]).toHaveLength(EXPORT_COLUMNS.length);
    expect(rows[0].every((value) => value.trim() !== "")).toBe(true);
    expect(rows[0].slice(16)).toEqual(["Steel ball valve DN50", "848180", "180", "42.5", "7650"]);
  });
});

describe("buildCsv", () => {
  it("produces CRLF-terminated CSV with header", () => {
    const csv = buildCsv(["a", "b"], [["1", "2"]]);
    expect(csv).toBe("a,b\r\n1,2\r\n");
  });
});
