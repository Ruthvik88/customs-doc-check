"use strict";

import { createBrowserClient } from "@supabase/ssr";

// Browser (client-component) Supabase client. Returns null if env is absent
// (e.g. during Next.js prerender without .env) so the build doesn't fail.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
