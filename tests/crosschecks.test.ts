import { describe, it, expect } from "vitest";
import {
  runAllCrossChecks,
  invoiceTotalCheck,
  lineItemMathCheck,
  lineItemQtyCheck,
  packagesCheck,
  grossWeightCheck,
  containerCheck,
  currencyIncotermCheck,
  supplierConsistencyCheck,
  unresolvedFailed,
  hasUnresolvedFailed,
  fieldsNeedingReview,
} from "~/lib/crosschecks";
import { containerCheckDigit } from "~/lib/iso6346";

const validContainer = "MSKU123456" + String(containerCheckDigit("MSKU123456"));

const line = (overrides: any = {}) => ({
  description: "item",
  hsn: "940540",
  qty: 10,
  unitPrice: 5,
  lineTotal: 50,
  ...overrides,
});

const doc = (overrides: any = {}) => ({
  total: 100,
  currency: "USD",
  incoterm: "FOB",
  supplier: "Acme Corp",
  packages: 10,
  grossWeight: 1000,
  containers: [validContainer],
  lines: [line()],
  ...overrides,
});

const input = (overrides: any = {}) => ({
  invoice: doc(),
  packingList: doc(),
  billOfLading: doc(),
  ...overrides,
});

describe("invoiceTotalCheck", () => {
  it("passes when total equals sum of line totals", () => {
    const r = invoiceTotalCheck(
      input({ invoice: doc({ total: 150, lines: [line({ lineTotal: 50 }), line({ lineTotal: 100 })] }) }),
    );
    expect(r.status).toBe("pass");
    expect(r.check_type).toBe("invoice_total");
    expect(r.delta).toBe("0.00");
  });

  it("fails when total differs from sum of line totals", () => {
    const r = invoiceTotalCheck(
      input({ invoice: doc({ total: 200, lines: [line({ lineTotal: 50 }), line({ lineTotal: 100 })] }) }),
    );
    expect(r.status).toBe("fail");
    expect(parseFloat(r.delta!)).toBeGreaterThan(0.01);
  });

  it("cannot_check when total missing", () => {
    const r = invoiceTotalCheck(input({ invoice: doc({ total: null }) }));
    expect(r.status).toBe("cannot_check");
  });

  it("cannot_check when there are no lines", () => {
    const r = invoiceTotalCheck(input({ invoice: doc({ total: 100, lines: [] }) }));
    expect(r.status).toBe("cannot_check");
  });
});

describe("lineItemMathCheck", () => {
  it("passes when line total equals qty x unit price", () => {
    const r = lineItemMathCheck(input({ invoice: doc({ lines: [line({ qty: 2400, unitPrice: 6.8, lineTotal: 16320 })] }) }));
    expect(r.status).toBe("pass");
  });

  it("fails when line total does not match qty x unit price", () => {
    const r = lineItemMathCheck(
      input({ invoice: doc({ lines: [line({ qty: 2400, unitPrice: 6.8, lineTotal: 16000 })] }) }),
    );
    expect(r.status).toBe("fail");
  });

  it("cannot_check when line data incomplete", () => {
    const r = lineItemMathCheck(input({ invoice: doc({ lines: [line({ qty: null })] }) }));
    expect(r.status).toBe("cannot_check");
  });
});

describe("lineItemQtyCheck (reordered rows)", () => {
  it("passes when packing list rows are reordered but match by HSN", () => {
    const r = lineItemQtyCheck(
      input({
        invoice: doc({
          lines: [line({ description: "LED panel", hsn: "940540", qty: 2400 }), line({ description: "Bracket", hsn: "830249", qty: 2400 })],
        }),
        packingList: doc({
          lines: [line({ description: "Bracket", hsn: "830249", qty: 2400 }), line({ description: "LED panel", hsn: "940540", qty: 2400 })],
        }),
      }),
    );
    expect(r.status).toBe("pass");
    expect(r.details.matched_lines).toBe(2);
  });

  it("fails when quantities differ after matching", () => {
    const r = lineItemQtyCheck(
      input({
        invoice: doc({ lines: [line({ hsn: "940540", qty: 2400 })] }),
        packingList: doc({ lines: [line({ hsn: "940540", qty: 2500 })] }),
      }),
    );
    expect(r.status).toBe("fail");
  });

  it("cannot_check when one side has no lines", () => {
    const r = lineItemQtyCheck(input({ invoice: doc({ lines: [] }) }));
    expect(r.status).toBe("cannot_check");
  });
});

describe("packagesCheck", () => {
  it("passes when all documents agree", () => {
    const r = packagesCheck(input());
    expect(r.status).toBe("pass");
  });

  it("fails when packing list and bill of lading differ", () => {
    const r = packagesCheck(
      input({ packingList: doc({ packages: 40 }), billOfLading: doc({ packages: 38 }) }),
    );
    expect(r.status).toBe("fail");
  });

  it("cannot_check when fewer than two documents report packages", () => {
    const r = packagesCheck(input({ packingList: doc({ packages: null }), billOfLading: doc({ packages: null }) }));
    expect(r.status).toBe("cannot_check");
  });
});

describe("grossWeightCheck", () => {
  it("flags the seeded weight mismatch: invoice 3120 vs packing list 3165 (1.44%)", () => {
    const r = grossWeightCheck(
      input({
        invoice: doc({ grossWeight: 3120 }),
        packingList: doc({ grossWeight: 3165 }),
        billOfLading: doc({ grossWeight: null }),
        weightTolerance: 0.005,
      }),
    );
    expect(r.status).toBe("fail");
    expect(parseFloat(r.delta!)).toBeGreaterThan(0.5);
  });

  it("passes when weights agree", () => {
    const r = grossWeightCheck(
      input({
        invoice: doc({ grossWeight: 1460 }),
        packingList: doc({ grossWeight: 1460 }),
        billOfLading: doc({ grossWeight: 1460 }),
      }),
    );
    expect(r.status).toBe("pass");
  });

  it("tolerance edge: exactly 0.5% passes, 0.6% fails", () => {
    const atEdge = grossWeightCheck(
      input({
        invoice: doc({ grossWeight: 1000 }),
        packingList: doc({ grossWeight: 1005 }),
        billOfLading: doc({ grossWeight: 1000 }),
        weightTolerance: 0.005,
      }),
    );
    expect(atEdge.status).toBe("pass"); // 1000 vs 1005 = 0.5%, within tolerance

    const overEdge = grossWeightCheck(
      input({
        invoice: doc({ grossWeight: 1000 }),
        packingList: doc({ grossWeight: 1006 }),
        billOfLading: doc({ grossWeight: 1000 }),
        weightTolerance: 0.005,
      }),
    );
    expect(overEdge.status).toBe("fail"); // 0.6% > 0.5%
  });

  it("cannot_check when fewer than two documents report weight", () => {
    const r = grossWeightCheck(
      input({
        invoice: doc({ grossWeight: 1000 }),
        packingList: doc({ grossWeight: null }),
        billOfLading: doc({ grossWeight: null }),
      }),
    );
    expect(r.status).toBe("cannot_check");
  });
});

describe("containerCheck", () => {
  it("passes for valid matching containers", () => {
    const r = containerCheck(input());
    expect(r.status).toBe("pass");
  });

  it("fails when container sets differ", () => {
    const other = "TCNU987654" + String(containerCheckDigit("TCNU987654"));
    const r = containerCheck(
      input({ packingList: doc({ containers: [validContainer] }), billOfLading: doc({ containers: [other] }) }),
    );
    expect(r.status).toBe("fail");
  });

  it("fails when a container fails the ISO 6346 check digit", () => {
    const r = containerCheck(
      input({ packingList: doc({ containers: ["MSKU1234561"] }), billOfLading: doc({ containers: ["MSKU1234561"] }) }),
    );
    expect(r.status).toBe("fail");
    expect((r.details as { invalid_containers: unknown[] }).invalid_containers.length).toBeGreaterThan(0);
  });

  it("cannot_check when neither document has containers", () => {
    const r = containerCheck(
      input({ packingList: doc({ containers: [] }), billOfLading: doc({ containers: [] }) }),
    );
    expect(r.status).toBe("cannot_check");
  });
});

describe("currencyIncotermCheck", () => {
  it("passes when currency and incoterm agree", () => {
    const r = currencyIncotermCheck(input());
    expect(r.status).toBe("pass");
  });

  it("fails when currency differs", () => {
    const r = currencyIncotermCheck(
      input({ invoice: doc({ currency: "USD" }), packingList: doc({ currency: "EUR" }) }),
    );
    expect(r.status).toBe("fail");
  });

  it("cannot_check when fewer than two documents report currency/incoterm", () => {
    const r = currencyIncotermCheck(
      input({
        invoice: doc({ currency: "USD", incoterm: "FOB" }),
        packingList: doc({ currency: null, incoterm: null }),
        billOfLading: doc({ currency: null, incoterm: null }),
      }),
    );
    expect(r.status).toBe("cannot_check");
  });
});

describe("supplierConsistencyCheck", () => {
  it("passes when supplier names match", () => {
    const r = supplierConsistencyCheck(input());
    expect(r.status).toBe("pass");
  });

  it("fails when supplier names differ", () => {
    const r = supplierConsistencyCheck(
      input({ invoice: doc({ supplier: "Acme Corp" }), packingList: doc({ supplier: "Other Corp" }) }),
    );
    expect(r.status).toBe("fail");
  });

  it("cannot_check when fewer than two documents report a supplier", () => {
    const r = supplierConsistencyCheck(
      input({
        invoice: doc({ supplier: "Acme" }),
        packingList: doc({ supplier: null }),
        billOfLading: doc({ supplier: null }),
      }),
    );
    expect(r.status).toBe("cannot_check");
  });
});

describe("runAllCrossChecks / helpers", () => {
  it("returns one result per check type", () => {
    const results = runAllCrossChecks(input());
    expect(results.length).toBe(8);
    expect(new Set(results.map((r) => r.check_type)).size).toBe(8);
  });

  it("unresolvedFailed returns only fails", () => {
    const results = runAllCrossChecks(
      input({ invoice: doc({ total: 200, lines: [line({ lineTotal: 50 })] }) }),
    );
    const fails = unresolvedFailed(results);
    expect(fails.length).toBeGreaterThan(0);
    expect(fails.every((r) => r.status === "fail")).toBe(true);
  });

  it("hasUnresolvedFailed / fieldsNeedingReview", () => {
    const clean = runAllCrossChecks(
      input({ invoice: doc({ total: 50, lines: [line({ lineTotal: 50 })] }) }),
    );
    expect(hasUnresolvedFailed(clean)).toBe(false);
    expect(fieldsNeedingReview(clean).length).toBe(0);

    const dirty = runAllCrossChecks(
      input({ invoice: doc({ total: 200, lines: [line({ lineTotal: 50 })] }) }),
    );
    expect(hasUnresolvedFailed(dirty)).toBe(true);
    expect(fieldsNeedingReview(dirty).length).toBeGreaterThan(0);
  });

  it("cannot_check is not pass", () => {
    const r = invoiceTotalCheck(input({ invoice: doc({ total: null }) }));
    expect(r.status).toBe("cannot_check");
    expect(r.status).not.toBe("pass");
  });
});
