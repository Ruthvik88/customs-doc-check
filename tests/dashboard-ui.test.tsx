// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/(app)/dashboard/page";

const { supabaseClient } = vi.hoisted(() => ({
  supabaseClient: {
    from: () => ({
      select: () => ({
        order: async () => ({
          data: [
            {
              id: "shipment-1",
              shipment_number: "SHP-100",
              supplier_id: "supplier-1",
              status: "Draft",
              updated_at: "2026-11-08T10:00:00.000Z",
              suppliers: [{ name: "Harbor Imports" }],
            },
            {
              id: "shipment-2",
              shipment_number: "SHP-200",
              supplier_id: "supplier-2",
              status: "Approved",
              updated_at: "2026-11-08T11:00:00.000Z",
              suppliers: [{ name: "Northern Cargo" }],
            },
          ],
          error: null,
        }),
      }),
    }),
  },
}));

vi.mock("@/hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => supabaseClient,
}));

afterEach(cleanup);

describe("dashboard shipment controls", () => {
  it("searches and filters the displayed shipments, then clears both filters", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    expect(await screen.findByText("SHP-100")).toBeTruthy();
    expect(screen.getByText("SHP-200")).toBeTruthy();

    await user.type(screen.getByRole("searchbox", { name: "Search shipments" }), "Northern");
    await waitFor(() => {
      expect(screen.queryByText("SHP-100")).toBeNull();
      expect(screen.getByText("SHP-200")).toBeTruthy();
    });

    await user.clear(screen.getByRole("searchbox", { name: "Search shipments" }));
    await user.click(screen.getByRole("button", { name: /Draft/ }));
    await waitFor(() => {
      expect(screen.getByText("SHP-100")).toBeTruthy();
      expect(screen.queryByText("SHP-200")).toBeNull();
    });

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => {
      expect(screen.getByText("SHP-100")).toBeTruthy();
      expect(screen.getByText("SHP-200")).toBeTruthy();
    });
  });
});
