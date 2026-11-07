"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { role } = useSession();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);
  const manager = role === "documentation_manager";

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex lg:w-60 flex-col border-r border-[var(--border)] bg-[var(--card)] h-screen">
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-[var(--foreground)]">
          <span className="text-[var(--primary)]">⟡</span>
          <span className="tracking-tight">Doc Check</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        <NavItem href="/dashboard" label="Shipments" />
        {manager && <NavItem href="/export" label="Export" />}
        {manager && <NavItem href="/reports" label="Accuracy report" />}
      </nav>
      <div className="p-4 border-t border-[var(--border)]">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full text-sm"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </aside>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
    >
      {label}
    </Link>
  );
}
