"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  ClipboardCheck,
  FileOutput,
  LogOut,
  ChevronLeft,
  X,
  ShieldCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Shipments", icon: <ClipboardCheck size={16} strokeWidth={1.75} /> },
  { href: "/export", label: "Export", icon: <FileOutput size={16} strokeWidth={1.75} /> },
  { href: "/reports", label: "Accuracy report", icon: <BarChart3 size={16} strokeWidth={1.75} /> },
] as const;

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const { session, role, loading } = useSession();
  const pathname = usePathname();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const manager = role === "documentation_manager";

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const items = [
    NAV_ITEMS[0],
    ...(manager ? [NAV_ITEMS[1], NAV_ITEMS[2]] : []),
  ];

  return (
    <aside
      data-collapsed={collapsed}
      data-mobile-navigation="true"
      className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-3rem)] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card)/0.97)] backdrop-blur-lg transition-[width,transform] duration-200 ease-out lg:static lg:inset-0 lg:w-[260px] lg:translate-x-0 ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Brand + collapse toggle */}
      <div className="flex items-center justify-between p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-heading font-semibold text-[hsl(var(--foreground))] tracking-tight text-sm no-underline"
        >
          <ShieldCheck aria-hidden="true" size={18} strokeWidth={1.75} className="text-[hsl(var(--primary))]" />
          <span className={collapsed ? "hidden lg:inline" : ""}>Customs Doc Check</span>
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden min-h-10 min-w-10 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--ring))] lg:flex"
            aria-label="Collapse navigation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden min-h-10 min-w-10 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--ring))] lg:flex"
            aria-label="Expand navigation"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--ring))] lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav id="primary-navigation" aria-label="Primary navigation" className="flex-1 flex-wrap gap-1 overflow-y-auto px-3 pb-3 lg:flex-col lg:pb-0">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`nav-item ${active ? "nav-item-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon flex-shrink-0">{item.icon}</span>
              <span className={collapsed ? "hidden lg:inline" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: role capsule + sign out */}
      <div className="border-t border-[hsl(var(--border))] mt-auto p-3">
        <div className={`mb-3 flex items-center gap-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-2 py-1.5 ${collapsed ? "lg:hidden" : ""}`}>
          <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono truncate">
            {session?.user?.email}
          </span>
          <Badge
            variant={role === "documentation_manager" ? "success" : role === "documentation_executive" ? "primary" : "outline"}
            className="text-xs px-2 py-0.5"
          >
              {role?.replace("_", " ") ?? (loading ? "Loading role…" : "Role unavailable")}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={!supabase}
          className={`w-full text-[10px] px-3 py-2 ${collapsed ? "lg:px-1" : ""}`}
          aria-label="Sign out"
        >
          <LogOut className="w-3 h-3 mr-1.5" aria-hidden="true" />
          <span className={collapsed ? "hidden lg:inline" : ""}>Sign out</span>
        </Button>
      </div>
    </aside>
  );
}
