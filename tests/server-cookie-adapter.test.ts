import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ cookieOptions: null as any }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [{ name: "sb-access-token", value: "incoming" }],
    set: () => { throw new Error("Cookies can only be modified in a Server Action or Route Handler."); },
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: any) => {
    state.cookieOptions = options.cookies;
    return {};
  }),
}));

import { createClient } from "@/lib/supabase/server";

describe("server Supabase cookie adapter", () => {
  it("reads request cookies and tolerates read-only Server Component rendering", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    await createClient();

    expect(state.cookieOptions.getAll()).toEqual([
      { name: "sb-access-token", value: "incoming" },
    ]);
    expect(() => state.cookieOptions.setAll([
      { name: "sb-access-token", value: "refreshed", options: { path: "/" } },
    ])).not.toThrow();
  });
});
