import { createClient } from "@/lib/supabase/server";
import { AccuracyReport } from "@/components/reports/accuracy-report";

export const dynamic = "force-dynamic";

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

// Display names and context for customs declaration fields tracked in the ledger.
// Keys that are not in the map are humanized from the database field key.
const FIELD_DISPLAY: Record<string, { label: string; context: string }> = {
  gross_weight_kg: {
    label: "Gross Weight",
    context: "Header & Summary • Bill of Lading / Packing List",
  },
  hs_code: {
    label: "HSN / Tariff Classification",
    context: "Line Items • 6 to 8-digit customs harmonized code",
  },
  consignee_name: {
    label: "Consignee Name",
    context: "Entity Verification • Importer of record",
  },
  invoice_number: {
    label: "Invoice Number",
    context: "Commercial Invoice Identifier",
  },
  consignee_gstin: {
    label: "Consignee GSTIN",
    context: "Tax & Regulatory ID match",
  },
  port_route: {
    label: "Port Route / Discharge",
    context: "UN/LOCODE & Sea Terminal codes",
  },
  invoice_total: {
    label: "Declared Total Value",
    context: "Invoice Currency & Customs Valuation",
  },
  incoterms: {
    label: "Incoterms",
    context: "FOB, CIF, CFR rule definitions",
  },
  net_weight_kg: {
    label: "Net Weight",
    context: "Packing List manifest tare validation",
  },
  item_description: {
    label: "Item Description",
    context: "Material specification & commercial text",
  },
};

function humanize(key: string): string {
  return key
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ReportsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="rounded-xl glass p-6 text-center">
        <h2 className="text-lg font-headline font-semibold text-customs-ink-primary">
          Accuracy Report
        </h2>
        <p className="text-sm text-customs-ink-secondary">
          Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and
          NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the dev server.
        </p>
      </div>
    );
  }

  const { data: editsData } = await supabase
    .from("field_edits")
    .select("*, suppliers(name)")
    .order("created_at", { ascending: false });

  const edits = editsData ?? [];

  const byKey = new Map<string, { total: number; edited: number }>();
  const bySupplierMap = new Map<string, { total: number; edited: number }>();

  for (const e of edits) {
    const keyAcc = byKey.get(e.field_key) ?? { total: 0, edited: 0 };
    keyAcc.total += 1;
    if (e.action === "edit") {
      keyAcc.edited += 1;
    }
    byKey.set(e.field_key, keyAcc);

    const supplier = e.suppliers?.name ?? "Unknown supplier";
    const supAcc = bySupplierMap.get(supplier) ?? { total: 0, edited: 0 };
    supAcc.total += 1;
    if (e.action === "edit") {
      supAcc.edited += 1;
    }
    bySupplierMap.set(supplier, supAcc);
  }

  const totalReviewed = edits.length;
  const totalEdited = edits.filter((e) => e.action === "edit").length;

  const byField: FieldStat[] = Array.from(byKey.entries())
    .map(([key, stat]) => {
      const display = FIELD_DISPLAY[key] ?? {
        label: humanize(key),
        context: "Customs declaration field",
      };
      return {
        key,
        label: display.label,
        context: display.context,
        total: stat.total,
        edited: stat.edited,
        accuracy:
          stat.total === 0
            ? null
            : Math.round(((stat.total - stat.edited) / stat.total) * 100),
      };
    })
    .sort((a, b) => b.total - a.total || b.edited - a.edited);

  const bySupplier: SupplierStat[] = Array.from(bySupplierMap.entries())
    .map(([name, stat]) => ({
      name,
      total: stat.total,
      edited: stat.edited,
      accuracy:
        stat.total === 0
          ? null
          : Math.round(((stat.total - stat.edited) / stat.total) * 100),
    }))
    .sort((a, b) => b.total - a.total || b.edited - a.edited);

  return (
    <AccuracyReport
      byField={byField}
      bySupplier={bySupplier}
      totalReviewed={totalReviewed}
      totalEdited={totalEdited}
    />
  );
}
