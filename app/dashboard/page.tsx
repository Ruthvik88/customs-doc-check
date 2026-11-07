import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLOR: Record<string, string> = {
  Draft: "badge-outline",
  Extracting: "badge-primary",
  "Needs review": "badge-warning",
  "Ready for approval": "badge-primary",
  Approved: "badge-success",
  Exported: "badge-outline",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: shipmentsData } = await supabase
    .from("shipments")
    .select("*, suppliers(name)")
    .order("created_at", { ascending: false });
  const shipments = shipmentsData ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Shipments</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Track extraction status and cross-check results per shipment.
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search shipment number, supplier…"
            className="input w-full md:w-80"
          />
          <Badge variant="outline">All statuses</Badge>
          {Object.entries(STATUS_COLOR).map(([status, cls]) => (
            <Button key={status} variant="outline" size="sm" className={cls}>
              {status}
            </Button>
          ))}
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className="card p-12 text-center">
          <Skeleton height={40} width={200} className="mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No shipments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <th className="pb-3 font-semibold">Shipment</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
                >
                  <td className="pb-4">
                    <Link href={`/shipments/${s.id}`} className="text-[var(--foreground)] font-medium hover:underline">
                      {s.shipment_number}
                    </Link>
                  </td>
                  <td className="pb-4 text-[var(--foreground)]">{s.suppliers?.name || "—"}</td>
                  <td className="pb-4">
                    <Badge variant={statusVariant(s.status)} className="text-[var(--foreground)]">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="pb-4 text-right text-[var(--muted-foreground)]">
                    {new Date(s.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusVariant(status: string) {
  switch (status) {
    case "Approved": return "success";
    case "Needs review": return "warning";
    case "Extracting":
    case "Ready for approval": return "primary";
    default: return "outline";
  }
}
