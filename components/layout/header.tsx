"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { createClient } from "@/lib/supabase/browser";
import {
  ShieldCheck,
  LogOut,
  ClipboardList,
  BarChart3,
  FileOutput,
  Menu,
  X,
} from "lucide-react";

export function Header({
  mobileSidebarOpen = false,
  toggleMobileSidebar,
}: {
  mobileSidebarOpen?: boolean;
  toggleMobileSidebar?: () => void;
}) {
  const { session, role, loading } = useSession();
  const pathname = usePathname();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [localMobileOpen, setLocalMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const isOpen = toggleMobileSidebar ? mobileSidebarOpen : localMobileOpen;
  const handleToggle = () => {
    if (toggleMobileSidebar) {
      toggleMobileSidebar();
    } else {
      setLocalMobileOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.querySelector<HTMLElement>("#primary-navigation a")?.focus();
    } else if (wasOpen.current) {
      menuButtonRef.current?.focus();
    }
    wasOpen.current = isOpen;
  }, [isOpen]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isManager = role === "documentation_manager";

  // Only real, working routes: Shipments (/dashboard), Accuracy report (/reports), Export (/export)
  // Gated strictly by role permissions
  const navLinks = [
    { href: "/dashboard", label: "Shipments", icon: ClipboardList },
    ...(isManager
      ? [
          { href: "/reports", label: "Accuracy report", icon: BarChart3 },
          { href: "/export", label: "Export", icon: FileOutput },
        ]
      : []),
  ];

  return (
    <div className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
      <header className="pointer-events-auto w-full rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-zinc-900 dark:text-white no-underline group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white">
              Customs Doc Check
            </span>
          </Link>

          {/* Navigation Links - ONLY real working routes, role gated */}
          <nav
            id="primary-navigation"
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-medium"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-200 no-underline ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info, role badge, theme toggle, sign out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {session?.user && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.05] dark:border-white/[0.06] text-xs">
                <span
                  className="font-mono text-zinc-600 dark:text-zinc-300 max-w-[150px] truncate"
                  title={session.user.email}
                >
                  {session.user.email}
                </span>
                <Badge
                  variant={isManager ? "success" : "primary"}
                  className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                >
                  {role ? role.replace("_", " ") : "Executive"}
                </Badge>
              </div>
            )}

            {/* Theme Toggle (supports test accessibility labels) */}
            <ThemeToggle />

            {/* Working Sign out button */}
            {session && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              ref={menuButtonRef}
              type="button"
              className="md:hidden inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              onClick={handleToggle}
            >
              {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div
            id="mobile-navigation"
            data-mobile-navigation="true"
            className="md:hidden mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {session?.user && (
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.08] text-xs">
                <span className="font-mono text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">
                  {session.user.email}
                </span>
                <Badge variant="primary" className="text-[10px] uppercase">
                  {role ? role.replace("_", " ") : "Executive"}
                </Badge>
              </div>
            )}

            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (toggleMobileSidebar) toggleMobileSidebar();
                    else setLocalMobileOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors no-underline ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                      : "text-zinc-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {session && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
