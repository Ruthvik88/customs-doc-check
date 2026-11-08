"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col relative">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header mobileSidebarOpen={mobileSidebarOpen} toggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto bg-[var(--background)] p-4 lg:p-8">
          {children}
        </main>
      </div>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
