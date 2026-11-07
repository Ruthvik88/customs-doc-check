"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function RootPage() {
  const router = useRouter();
  const { session, role, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login");
    } else if (role === "documentation_manager") {
      router.replace("/export");
    } else {
      router.replace("/dashboard");
    }
  }, [session, role, loading, router]);

  return null;
}
