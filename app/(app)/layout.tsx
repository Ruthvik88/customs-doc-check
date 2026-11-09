"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      setMobileMenuOpen(false);
      document.getElementById("main-content")?.focus();
    }
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="relative flex min-h-screen flex-col bg-customs-surface">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header
        mobileSidebarOpen={mobileMenuOpen}
        toggleMobileSidebar={() => setMobileMenuOpen((o) => !o)}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="w-full flex-1 outline-none px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16"
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
