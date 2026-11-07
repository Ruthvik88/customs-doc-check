import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock the Supabase server module so we can test export gating and role
// permissions without a real database. The mock is table-aware: each table
// returns a chain configured with the data registered for it. The chain is
// awaitable (like Supabase's PostgrestFilterBuilder).
// ---------------------------------------------------------------------------

type Row = Record<string, any>;
type Chain = {
  select: (...args: any[]) => Chain;
  eq: (...args: any[]) => Chain;
  single: () => Promise<{ data: any; error: any; count?: number }>;
  in: (...args: any[]) => Chain;
  is: (...args: any[]) => Chain;
  order: (...args: any[]) => Chain;
  insert: () => Promise<{ data: any; error: any }>;
  update: () => Promise<{ data: any; error: any }>;
  delete: () => Promise<{ data: any; error: any }>;
  then: (resolve: any, reject: any) => Promise<any>;
  _data?: Row[];
  _error?: any;
  _count?: number;
};

function makeChain(): Chain {
  const c: any = {
    _data: undefined,
    _error: undefined,
    _count: undefined,
    select: (..._args: any[]) => c,
    eq: (..._args: any[]) => c,
    single: async () => {
      if (c._error) return { data: null, error: c._error };
      if (c._count !== undefined) return { data: null, error: null, count: c._count };
      return { data: c._data?.[0] ?? null, error: null };
    },
    in: (..._args: any[]) => c,
    is: (..._args: any[]) => c,
    order: (..._args: any[]) => c,
    insert: (..._args: any[]) => c,
    update: (..._args: any[]) => c,
    delete: (..._args: any[]) => c,
    then: async (_resolve: any, _reject: any) => {
      if (c._error) { _reject(c._error); return; }
      if (c._count !== undefined) { _resolve({ data: null, error: null, count: c._count }); return; }
      _resolve({ data: c._data?.[0] ?? null, error: null });
    },
  };
  return c;
}

const tables: Record<string, Chain> = {};

const supabaseMock = {
  auth: { getUser: vi.fn() },
  from: vi.fn((table: string) => {
    if (!tables[table]) tables[table] = makeChain();
    return tables[table];
  }),
};

const serviceMock = {
  from: vi.fn((table: string) => {
    if (!tables[table]) tables[table] = makeChain();
    return tables[table];
  }),
  storage: {
    from: vi.fn(() => ({
      createSignedUrl: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      upload: vi.fn(),
    })),
  },
};

vi.mock("@/lib/supabase/server", () => ({
  requireSupabaseClient: vi.fn(() => supabaseMock),
  requireServiceRoleClient: vi.fn(() => serviceMock),
}));

function setUser(user: any) {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user }, error: null });
}
function setNoUser() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
}
function setProfile(role: string) {
  tables["profiles"] = makeChain();
  tables["profiles"]._data = [{ role }];
}
function setTableData(table: string, data: Row | null, count?: number) {
  tables[table] = makeChain();
  tables[table]._data = data ? [data] : [];
  if (count !== undefined) tables[table]._count = count;
}

const VALID_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("export gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(tables).forEach((t) => delete tables[t]);
  });

  it("returns 401 when unauthenticated", async () => {
    setNoUser();
    const { POST } = await import("@/app/api/export/route");
    const res = await POST(new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when executive tries to export", async () => {
    setUser({ id: "exec-id" });
    setProfile("documentation_executive");
    const { POST } = await import("@/app/api/export/route");
    const res = await POST(new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(403);
  });

  it("blocks export when shipment is not Approved", async () => {
    setUser({ id: "manager-id" });
    setProfile("documentation_manager");
    setTableData("shipments", { status: "Draft", id: VALID_ID });
    const { POST } = await import("@/app/api/export/route");
    const res = await POST(new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(409);
  });

  it("blocks export when a field needs review", async () => {
    setUser({ id: "manager-id" });
    setProfile("documentation_manager");
    setTableData("shipments", { status: "Approved", id: VALID_ID });
    setTableData("fields", null, 1); // count=1 needs_review field
    const { POST } = await import("@/app/api/export/route");
    const res = await POST(new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(409);
  });

  it("blocks export when an unresolved failed cross-check exists", async () => {
    setUser({ id: "manager-id" });
    setProfile("documentation_manager");
    setTableData("shipments", { status: "Approved", id: VALID_ID });
    setTableData("fields", null, 0);
    setTableData("crosscheck_results", null, 1); // count=1 unresolved fail
    const { POST } = await import("@/app/api/export/route");
    const res = await POST(new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(409);
  });

  it("returns 200 when all gates pass", async () => {
    setUser({ id: "manager-id" });
    setProfile("documentation_manager");
    setTableData("shipments", {
      status: "Approved", id: VALID_ID, suppliers: { name: "Company C" },
      shipment_number: "SHP-24812", invoice_number: "INV-SE-3310", invoice_date: "2025-10-22",
      currency: "EUR", incoterm: "CIF", total_packages: 6, gross_weight_kg: 1460,
      net_weight_kg: 1420, containers: ["CMAU5555552"], bl_number: "BL-SE-7741",
      vessel: "MV Baltic Trader", port_of_loading: "Gothenburg, Sweden",
      port_of_discharge: "Nhava Sheva, India",
    });
    setTableData("fields", null, 0);
    setTableData("crosscheck_results", null, 0);
    const { POST } = await import("@/app/api/export/route");
    const res = await POST(new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(200);
  });
});

describe("role permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(tables).forEach((t) => delete tables[t]);
  });

  it("upload route returns 401 when unauthenticated", async () => {
    setNoUser();
    const { POST } = await import("@/app/api/upload/route");
    const res = await POST(new Request("http://localhost/api/upload", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("fields route returns 401 when unauthenticated", async () => {
    setNoUser();
    const { PATCH } = await import("@/app/api/fields/[id]/route");
    const res = await PATCH(new Request("http://localhost/api/fields/f1", {
      method: "PATCH", body: JSON.stringify({ value: "x" }),
    }), { params: { id: "f1" } });
    expect(res.status).toBe(401);
  });

  it("extract route returns 403 for manager", async () => {
    setUser({ id: "manager-id" });
    setProfile("documentation_manager"); // manager cannot extract
    const { POST } = await import("@/app/api/extract/route");
    const res = await POST(new Request("http://localhost/api/extract", {
      method: "POST", body: JSON.stringify({ shipmentId: VALID_ID }),
    }));
    expect(res.status).toBe(403);
  });
});
