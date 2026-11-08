"use strict";

import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server Supabase client using the user's session (anon key). RLS applies.
// Returns null if env is absent (e.g. during Next.js prerender without .env).
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components are read-only; middleware persists refreshed sessions.
        }
      },
    },
  });
}

// Server-only service-role client. Bypasses RLS; callers must authorize first
// and use database RPCs for privileged multi-row writes. Returns null if env is absent.
export function createServiceRoleClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key);
}

// Like createClient, but throws a clear error if Supabase is not configured.
// Use in API routes (always run at runtime with env present).
export async function requireSupabaseClient() {
  const c = await createClient();
  if (!c) throw new Error("Supabase not configured");
  return c;
}

export function requireServiceRoleClient() {
  const c = createServiceRoleClient();
  if (!c) throw new Error("Supabase service role not configured");
  return c;
}
