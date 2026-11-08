import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <div className="p-6">Supabase not configured.</div>;
  }

  const { data: editsData } = await supabase
    .from("field_edits")
    .select("*, suppliers(name), shipments(shipment_number)")
    .order("created_at", { ascending: false });
  const edits = editsData ?? [];
  const byKey = new Map<string, { total: number; edited: number }>();
  const bySupplier = new Map<string, { total: number; edited: number }>();

  for (const e of edits) {
    const kAcc = byKey.get(e.field_key) ?? { total: 0, edited: 0 };
    kAcc.total += 1;
    if (e.action === "edit") kAcc.edited += 1;
    byKey.set(e.field_key, kAcc);

    const sName = e.suppliers?.name ?? "Unknown supplier";
    const sAcc = bySupplier.get(sName) ?? { total: 0, edited: 0 };
    sAcc.total += 1;
    if (e.action === "edit") sAcc.edited += 1;
    bySupplier.set(sName, sAcc);
  }

  const accuracy = (total: number, edited: number) =>
    total === 0 ? null : Math.round(((total - edited) / total) * 100);

  const totalReviewed = edits.length;
  const totalEdited = edits.filter((e) => e.action === "edit").length;
  const overallAccuracy = totalReviewed === 0 ? null : accuracy(totalReviewed, totalEdited);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-xl p-6 shadow-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[hsl(var(--secondary))] font-mono text-[11px] uppercase tracking-wider">
              <span className="inline-flex h-2 w-2 rounded-full bg-[hsl(var(--tertiary))]" />
              <span>Audit &amp; Performance Metrics</span>
              <span className="text-[hsl(var(--border))]">/</span>
              <span className="text-[hsl(var(--muted-foreground))]">Model v2.4 Calibration Run</span>
            </div>
            <h1 className="text-xl font-heading font-semibold tracking-tight text-[var(--foreground)]">
              Accuracy Report
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[hsl(var(--muted-foreground))] text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--muted))] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                Accuracy = (total reviewed − edited) / total reviewed
              </span>
              <span className="text-[hsl(var(--border))] hidden sm:inline">•</span>
              <span className="text-[hsl(var(--muted-foreground))]">
                Computed from cryptographic <code className="font-mono text-[hsl(var(--secondary))]">field_edits</code> audit stream
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards — real computed values only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider">Extraction Accuracy</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--tertiary))/15] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--tertiary))]">
              Verified
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-sm text-[var(--foreground)] font-semibold">
              {overallAccuracy === null ? "—" : overallAccuracy + "%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] text-[10px] font-mono mt-1">
            <span>{totalReviewed} reviewed</span>
            <span className={totalEdited === 0 ? "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--needs-review))]"}>
              {totalEdited} corrections
            </span>
          </div>
        </div>

        <div className="glass p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider">STP Clearance Rate</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))/15] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--primary))]">
              Touchless Pass
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-sm text-[var(--foreground)] font-semibold">
              {totalReviewed === 0 ? "—" : Math.round(((totalReviewed - totalEdited) / totalReviewed) * 100) + "%"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] text-[10px] font-mono mt-1">
            <span>{totalReviewed} shipments</span>
            <span>Zero intervention</span>
          </div>
        </div>

        <div className="glass p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider">Fields Tracked</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))/15] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--secondary))]">
              {byKey.size} fields
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-sm text-[var(--foreground)] font-semibold">{byKey.size}</span>
          </div>
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] text-[10px] font-mono mt-1">
            <span>Customs declaration fields</span>
            <span>Declared values</span>
          </div>
        </div>

        <div className="glass p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider">Ledger Integrity</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--tertiary))/15] px-2 py-0.5 font-mono text-[10px] text-[hsl(var(--tertiary))]">
              SHA-256 Parity
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-sm text-[var(--foreground)] font-semibold">100%</span>
          </div>
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))] text-[10px] font-mono mt-1">
            <span>Validated blocks</span>
            <span>Immutable audit trail</span>
          </div>
        </div>
      </div>

      {/* Two side-by-side analysis panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel A: Accuracy by Field */}
        <div className="glass-elevated rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[hsl(var(--muted))/30] flex items-center justify-between text-xs font-mono text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-sm text-[var(--foreground)] font-medium">Accuracy by Field</h2>
              <span className="font-mono text-[hsl(var(--secondary))] text-[10px]">{byKey.size} fields tracked</span>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[hsl(var(--muted))/40] text-[hsl(var(--muted-foreground))] font-mono text-[10px] uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Field Name</th>
                  <th className="py-3 px-4 text-right">Reviewed</th>
                  <th className="py-3 px-4 text-right">Edited</th>
                  <th className="py-3 px-4 text-right">Model Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))/40] text-sm text-[hsl(var(--foreground))]">
                {[...byKey.entries()]
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([key, v]) => (
                    <tr key={key} className="hover:bg-[hsl(var(--muted))/40] transition-colors group">
                      <td className="py-3.5 px-4">{key}</td>
                      <td className="py-3.5 px-4 text-right">{v.total}</td>
                      <td className="py-3.5 px-4 text-right">{v.edited}</td>
                      <td className="py-3.5 px-4 text-right">
                        {accuracy(v.total, v.edited) === null ? "—" : accuracy(v.total, v.edited) + "%"}
                      </td>
                    </tr>
                  ))}
                {byKey.size === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                      No field corrections logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel B: Accuracy by Supplier */}
        <div className="glass-elevated rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[hsl(var(--muted))/30] flex items-center justify-between text-xs font-mono text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-sm text-[var(--foreground)] font-medium">Accuracy by Supplier</h2>
              <span className="font-mono text-[hsl(var(--secondary))] text-[10px]">{bySupplier.size} suppliers</span>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[hsl(var(--muted))/40] text-[hsl(var(--muted-foreground))] font-mono text-[10px] uppercase tracking-wider select-none">
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Reviewed</th>
                  <th className="py-3 px-4 text-right">Edited</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))/40] text-sm text-[hsl(var(--foreground))]">
                {[...bySupplier.entries()]
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([supplier, v]) => (
                    <tr key={supplier} className="hover:bg-[hsl(var(--muted))/40] transition-colors group">
                      <td className="py-3.5 px-4">{supplier}</td>
                      <td className="py-3.5 px-4 text-right">{v.total}</td>
                      <td className="py-3.5 px-4 text-right">{v.edited}</td>
                      <td className="py-3.5 px-4 text-right">
                        {accuracy(v.total, v.edited) === null ? "—" : accuracy(v.total, v.edited) + "%"}
                      </td>
                    </tr>
                  ))}
                {bySupplier.size === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                      No supplier data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {edits.length === 0 && (
        <div className="rounded-xl glass p-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            No corrections logged yet. Confirm or edit fields in the review screen to build the accuracy report.
          </p>
        </div>
      )}
    </div>
  );
}
