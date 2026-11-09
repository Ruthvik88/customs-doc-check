import type { CrossCheckInput, DocView } from "./crosschecks";

function toNum(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

export function docViewFrom(fields: any[], lineItems: any[]): DocView {
  const get = (key: string) => fields.find((field) => field.key === key)?.value ?? null;
  const containers = get("containers");
  return {
    total: toNum(get("invoice_total")), currency: get("currency") ?? undefined,
    incoterm: get("incoterm") ?? undefined, supplier: get("supplier") ?? undefined,
    packages: toNum(get("packages")), grossWeight: toNum(get("gross_weight_kg")),
    containers: containers ? String(containers).split(",").map((item) => item.trim()).filter(Boolean) : [],
    lines: lineItems.map((line) => ({ description: line.description ?? "", hsn: line.hsn,
      qty: line.qty, unitPrice: line.unit_price, lineTotal: line.line_total })),
  };
}

export function crossCheckInput(fields: any[], lineItems: any[], documents: any[]): CrossCheckInput {
  const docMap = Object.fromEntries(documents.map((doc) => [doc.type, doc.id]));
  const view = (type: string) => {
    const id = docMap[type];
    return docViewFrom(fields.filter((field) => field.document_id === id),
      lineItems.filter((line) => line.document_id === id));
  };
  return { invoice: view("invoice"), packingList: view("packing_list"), billOfLading: view("bill_of_lading") };
}
