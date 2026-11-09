"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // Supabase not configured (e.g. missing env at build time).
      setLoading(false);
      return;
    }
    let mounted = true;
    let revision = 0;

    const syncSession = async (nextSession: any, requestRevision: number) => {
      setSession(nextSession);
      setRole(null);
      if (!nextSession) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", nextSession.user.id)
        .maybeSingle();

      if (!mounted || requestRevision !== revision) return;
      setRole(error ? null : data?.role ?? null);
      setLoading(false);
    };

    const initialRevision = ++revision;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (initialRevision === revision) {
        void syncSession(data.session, initialRevision);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const requestRevision = ++revision;
      queueMicrotask(() => {
        if (mounted) void syncSession(session, requestRevision);
      });
    });

    return () => {
      mounted = false;
      revision += 1;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, role, loading };
}
