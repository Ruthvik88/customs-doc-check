import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  user: null as { id: string } | null,
  cookieMethods: null as null | {
    getAll: () => { name: string; value: string }[];
    setAll: (cookies: any[]) => void;
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: any) => {
    state.cookieMethods = options.cookies;
    return {
      auth: {
        getUser: async () => {
          state.cookieMethods?.setAll([{ name: "sb-access-token", value: "refreshed", options: { path: "/", httpOnly: true } }]);
          return { data: { user: state.user } };
        },
      },
    };
  }),
}));

import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("middleware Supabase cookie refresh", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    state.user = null;
    state.cookieMethods = null;
  });

  it("passes refreshed cookies to the request and response", async () => {
    state.user = { id: "exec-1" };
    const request = new NextRequest("http://localhost/dashboard", {
      headers: { cookie: "sb-access-token=old" },
    });

    const response = await middleware(request);

    expect(state.cookieMethods?.getAll()).toEqual([
      expect.objectContaining({ name: "sb-access-token", value: "refreshed" }),
    ]);
    expect(request.cookies.get("sb-access-token")?.value).toBe("refreshed");
    expect(response.cookies.get("sb-access-token")?.value).toBe("refreshed");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("keeps refreshed cookies when redirecting an authenticated user from login", async () => {
    state.user = { id: "manager-1" };
    const response = await middleware(new NextRequest("http://localhost/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/dashboard");
    expect(response.cookies.get("sb-access-token")?.value).toBe("refreshed");
  });

  it("redirects unauthenticated users from protected routes", async () => {
    const response = await middleware(new NextRequest("http://localhost/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });
});
