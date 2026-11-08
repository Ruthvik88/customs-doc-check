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
  const { session, role } = useSession();
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
      className={`z-50 flex w-[260px] flex-col border-r border-[var(--border)] bg-[hsl(var(--card)/0.6)] backdrop-blur-lg supports-[backdrop-filter]:bg-[hsl(var(--card)/0.4)] transition-all duration-300 ease-in-out ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"} ${mobileOpen ? "lg:static lg:inset-0 lg:translate-x-0" : "fixed inset-y-0 left-0 -translate-x-full lg:static lg:inset-0 lg:translate-x-0"}`}
    >
      {/* Brand + collapse toggle */}
      <div className="flex items-center justify-between p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-heading font-semibold text-[hsl(var(--foreground))] tracking-tight text-sm no-underline"
        >
          <ShieldCheck aria-hidden="true" size={18} strokeWidth={1.75} className="text-[hsl(var(--primary))]" />
          {!collapsed && <span>Doc Check</span>}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Collapse navigation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Expand navigation"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}
        {mobileOpen && !collapsed && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Close navigation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav aria-label="Primary navigation" className="flex-1 flex-wrap gap-1 px-3 pb-3 lg:flex-col lg:pb-0">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`nav-item ${active ? "nav-item-active" : ""}`}
            >
              <span className="nav-icon flex-shrink-0">{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: role capsule + sign out */}
      <div className="border-t border-[var(--border)] mt-auto p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-[hsl(var(--input))] border border-[var(--border)] mb-3">
          <span className="text-[hsl(var(--muted-foreground))] text-[10px] font-mono truncate">
            {session?.user?.email}
          </span>
          <Badge
            variant={role === "documentation_manager" ? "success" : "primary"}
            className="text-[9px] px-2 py-0.5"
          >
            {role?.replace("_", " ") ?? "Role unavailable"}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={!supabase}
          className="w-full text-[10px] px-3 py-2"
        >
          <LogOut className="w-3 h-3 mr-1.5" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`nav-item ${active ? "nav-item-active" : ""}`}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </Link>
  );
}
