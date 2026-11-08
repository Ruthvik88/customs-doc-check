import { beforeEach, describe, expect, it, vi } from "vitest";

const rows: Record<string, any> = {};
const failures: Record<string, any> = {};

function query(table: string) {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    single: async () => ({ data: rows[table]?.[0] ?? null, error: failures[table] ?? null }),
    then: (resolve: (value: unknown) => void) => resolve({ data: rows[table] ?? [], error: failures[table] ?? null }),
  };
  return builder;
}

const userClient = {
  auth: { getUser: vi.fn(async () => ({ data: { user: { id: "exec-1" } }, error: null })) },
  from: vi.fn((table: string) => query(table)),
};
const serviceClient = {
  rpc: vi.fn(async () => ({ data: null, error: null })),
};

vi.mock("@/lib/supabase/server", () => ({
  requireSupabaseClient: async () => userClient,
  requireServiceRoleClient: () => serviceClient,
}));

describe("cross-check source query failures", () => {
  beforeEach(() => {
    Object.keys(rows).forEach((key) => delete rows[key]);
    Object.keys(failures).forEach((key) => delete failures[key]);
    userClient.from.mockClear();
    serviceClient.rpc.mockClear();
    rows.profiles = [{ role: "documentation_executive" }];
    rows.shipments = [{ id: "ship-1", created_by: "exec-1" }];
    rows.documents = [];
    rows.fields = [];
    rows.line_items = [];
  });

  it.each(["documents", "fields", "line_items"])("aborts when the %s query fails without replacing prior results", async (table) => {
    failures[table] = { message: "database unavailable" };
    const { POST } = await import("@/app/api/crosschecks/[shipmentId]/route");
    const response = await POST(new Request("http://localhost/api/crosschecks/ship-1", { method: "POST" }), {
      params: { shipmentId: "ship-1" },
    });
    expect(response.status).toBe(500);
    expect(serviceClient.rpc).not.toHaveBeenCalled();
  });
});
