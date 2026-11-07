import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    alias: [
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, "$1") },
      { find: /^~\/(.*)$/, replacement: path.resolve(__dirname, "$1") },
    ],
  },
})
