// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/header";
import AuthLayout from "@/app/(auth)/layout";

vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({ session: null, role: null, loading: false }),
}));

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
});

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  window.localStorage.clear();
});

describe("header theme toggle", () => {
  it("starts in light mode, toggles to dark, and remembers the selection", async () => {
    const user = userEvent.setup();
    render(<Header mobileSidebarOpen={false} toggleMobileSidebar={() => {}} />);

    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("customs-doc-check-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeTruthy();
  });

  it("reflects a previously restored dark theme", async () => {
    document.documentElement.classList.add("dark");
    render(<Header mobileSidebarOpen={false} toggleMobileSidebar={() => {}} />);

    expect(await screen.findByRole("button", { name: "Switch to light mode" })).toBeTruthy();
  });

  it("makes the theme switch available on the sign-in page", () => {
    render(<AuthLayout><div>Sign in</div></AuthLayout>);

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeTruthy();
  });
});
