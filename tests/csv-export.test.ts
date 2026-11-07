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
  it("has the expected 16 columns", () => {
    expect(EXPORT_COLUMNS).toHaveLength(16);
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
    expect(row[8]).toBe(6);
    expect(row[9]).toBe(1460);
    expect(row[10]).toBe(1420);
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
});

describe("buildCsv", () => {
  it("produces CRLF-terminated CSV with header", () => {
    const csv = buildCsv(["a", "b"], [["1", "2"]]);
    expect(csv).toBe("a,b\r\n1,2\r\n");
  });
});
