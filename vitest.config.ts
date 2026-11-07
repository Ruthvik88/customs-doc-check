import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    alias: {
      "~/lib": path.resolve(__dirname, "lib"),
      "~/lib/crosschecks": path.resolve(__dirname, "lib/crosschecks.ts"),
      "~/lib/iso6346": path.resolve(__dirname, "lib/iso6346.ts"),
      "~/lib/confidence": path.resolve(__dirname, "lib/confidence.ts"),
    },
  },
})
