import React from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
