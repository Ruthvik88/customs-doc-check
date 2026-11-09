"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { createClient } from "@/lib/supabase/browser";
import { ShieldCheck, User, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

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

  // Only real, working routes — role gated.
  const navLinks = [
    { href: "/dashboard", label: "Shipments", icon: ShieldCheck },
    ...(isManager
      ? [
          { href: "/reports", label: "Accuracy report", icon: ShieldCheck },
          { href: "/export", label: "Export", icon: ShieldCheck },
        ]
      : []),
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header
        className="pointer-events-auto h-12 w-full max-w-7xl bg-customs-surface-container-lowest/85 backdrop-blur-md rounded-full shadow-[0_8px_24px_rgba(15,27,45,0.06)] px-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-6">
          {/* Brand Logo & Name */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-customs-ink-primary no-underline group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-customs-primary rounded-full"
          >
            <div className="w-7 h-7 rounded-lg bg-customs-primary-container text-customs-on-primary-container flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <span className="font-headline-sm text-headline-sm text-customs-ink-primary font-bold tracking-tight whitespace-nowrap">
              Customs Doc Check
            </span>
          </Link>

          {/* Navigation Links - ONLY real working routes, role gated */}
          <nav
            id="primary-navigation"
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1 bg-customs-surface-container-low p-1 rounded-full"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3.5 py-1 rounded-full transition-colors no-underline font-body-sm text-body-sm ${
                    active
                      ? "bg-customs-primary text-customs-on-primary-container font-semibold shadow-sm"
                      : "text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-low/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {session?.user && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-label-code-sm text-label-code-sm text-customs-ink-secondary">
                {session.user.email}
              </span>
              <div className="h-5 inline-flex items-center gap-1.5 px-2 rounded-full bg-customs-status-confirmed-bg text-customs-status-confirmed-text font-label-code-sm text-label-code-sm font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-customs-status-confirmed-text"></span>
                {role ? role.replace("_", " ") : "Documentation Manager"}
              </div>
            </div>
          )}
          {/* Theme Toggle */}
          <ThemeToggle />
          <div className="w-8 h-8 rounded-full bg-customs-primary text-customs-on-primary flex items-center justify-center shadow-xs">
            <User className="w-4 h-4" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded-full text-customs-ink-secondary hover:text-customs-status-error-text transition-colors flex items-center justify-center"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Mobile menu toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            className="md:hidden inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-customs-ink-secondary hover:bg-customs-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-customs-primary"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={handleToggle}
          >
            {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div
            id="mobile-navigation"
            data-mobile-navigation="true"
            className="md:hidden mt-3 pt-3 border-t border-customs-border-hairline space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {session?.user && (
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-customs-border-hairline text-xs">
                <span className="font-label-code-sm text-label-code-sm text-customs-ink-secondary truncate max-w-[200px]">
                  {session.user.email}
                </span>
                <span className="font-label-code-sm text-label-code-sm text-customs-status-confirmed-text font-semibold uppercase tracking-wider">
                  {role ? role.replace("_", " ") : "Documentation Manager"}
                </span>
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
                      ? "bg-customs-primary text-customs-on-primary-container font-semibold shadow-sm"
                      : "text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-low/50"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}

            {session && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-customs-ink-secondary hover:text-customs-status-error-text hover:bg-customs-surface-container-low transition-colors"
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
