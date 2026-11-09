import React from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Circle,
  ClipboardCheck,
  FileCheck2,
} from "lucide-react";

const STATUS_STYLES: Record<string, { className: string; icon: typeof Circle }> = {
  Draft: { className: "badge-draft", icon: Circle },
  Extracting: { className: "badge-extracting", icon: Activity },
  "Needs review": { className: "badge-warning", icon: AlertTriangle },
  "Ready for approval": { className: "badge-ready", icon: ClipboardCheck },
  Approved: { className: "badge-approved", icon: BadgeCheck },
  Exported: { className: "badge-exported", icon: FileCheck2 },
};

export function ShipmentStatusBadge({ status }: { status: string }) {
  const presentation = STATUS_STYLES[status] ?? {
    className: "badge-outline",
    icon: Circle,
  };
  const Icon = presentation.icon;

  return (
    <span className={`badge ${presentation.className} whitespace-nowrap`}>
      <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
      <span>{status || "Unknown status"}</span>
    </span>
  );
}
