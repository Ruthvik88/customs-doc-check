"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { ShieldCheck, Menu, ChevronLeft } from "lucide-react";

export function Header({
  mobileSidebarOpen,
  toggleMobileSidebar,
}: {
  mobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}) {
  const { session, role } = useSession();

  return (
    <header className="relative z-50 w-full border-b border-[var(--border)] bg-[hsl(var(--background)/0.6)] backdrop-blur-xl supports-[backdrop-filter]:bg-[hsl(var(--background)/0.4)]">
      <div className="relative z-10 flex min-h-16 items-center justify-between px-4 lg:px-8">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
        >
          <ShieldCheck className="w-5 h-5 text-[hsl(var(--primary))]" aria-hidden="true" />
          <span className="font-heading font-semibold text-[hsl(var(--foreground))] tracking-tight text-sm">
            Customs Doc Check
          </span>
        </Link>

        {/* Global search (⌘K) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--input))] border border-[var(--border)]">
          <span className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]">
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search shipments…"
            className="bg-transparent border-none outline-none text-xs text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] w-full"
            aria-label="Global search"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-[10px] font-mono">⌘K</kbd>
        </div>

        {/* User telemetry */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--input))] border border-[var(--border)]">
            <span className="text-[hsl(var(--muted-foreground))] text-[11px] font-mono">{session?.user?.email}</span>
            <Badge
              variant={role === "documentation_manager" ? "success" : "primary"}
              className="text-[10px] px-2 py-0.5"
            >
              {role?.replace("_", " ") ?? "Role unavailable"}
            </Badge>
          </div>
          {/* Mobile menu toggle */}
          <button className="lg:hidden rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors" aria-label={mobileSidebarOpen ? "Close navigation" : "Open navigation"} onClick={toggleMobileSidebar}>
            {mobileSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
