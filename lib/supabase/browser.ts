"use strict";

import { createBrowserClient } from "@supabase/ssr";

// Browser (client-component) Supabase client. Reads cookies/headers from the
// browser; never exposes the service-role key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
