"use client";

import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";

export function Header() {
  const { session, role } = useSession();
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Customs Doc Check
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-[var(--muted-foreground)]">
            {session?.user?.email}
          </span>
          <Badge variant={role === "documentation_manager" ? "success" : "primary"} className="text-xs">
            {role?.replace("_", " ").toUpperCase() ?? "—"}
          </Badge>
        </div>
      </div>
    </header>
  );
}
