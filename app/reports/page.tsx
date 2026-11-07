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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Accuracy report</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Accuracy = (total reviewed − edited) / total reviewed, computed from
          logged field corrections. Powered by the field_edits audit trail.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
            Accuracy by field
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <th className="pb-3 font-semibold">Field</th>
                <th className="pb-3 font-semibold text-right">Reviewed</th>
                <th className="pb-3 font-semibold text-right">Edited</th>
                <th className="pb-3 font-semibold text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {[...byKey.entries()].sort((a, b) => b[1].total - a[1].total).map(([key, v]) => (
                <tr key={key} className="border-b border-[var(--border)]">
                  <td className="pb-3 text-[var(--foreground)]">{key}</td>
                  <td className="pb-3 text-right">{v.total}</td>
                  <td className="pb-3 text-right">{v.edited}</td>
                  <td className="pb-3 text-right">
                    {accuracy(v.total, v.edited) === null ? "—" : accuracy(v.total, v.edited) + "%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 border-b border-[var(--border)] pb-2">
            Accuracy by supplier
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold text-right">Reviewed</th>
                <th className="pb-3 font-semibold text-right">Edited</th>
                <th className="pb-3 font-semibold text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {[...bySupplier.entries()].sort((a, b) => b[1].total - a[1].total).map(([supplier, v]) => (
                <tr key={supplier} className="border-b border-[var(--border)]">
                  <td className="pb-3 text-[var(--foreground)]">{supplier}</td>
                  <td className="pb-3 text-right">{v.total}</td>
                  <td className="pb-3 text-right">{v.edited}</td>
                  <td className="pb-3 text-right">
                    {accuracy(v.total, v.edited) === null ? "—" : accuracy(v.total, v.edited) + "%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {edits.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-[var(--muted-foreground)]">No corrections logged yet. Confirm or edit fields in the review screen to build the accuracy report.</p>
        </div>
      )}
    </div>
  );
}
