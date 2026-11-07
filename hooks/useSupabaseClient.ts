"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

// Creates the browser Supabase client only after mount (useEffect), so it is
// never invoked during server-side rendering / prerendering (where env may be
// absent). Returns null until ready; callers should guard with `if (!client)`.
export function useSupabaseClient() {
  const [client, setClient] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    setClient(createClient());
  }, []);

  return client;
}
