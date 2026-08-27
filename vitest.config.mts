import path from "node:path";
import { defineConfig } from "vitest/config";

// Mirror the tsconfig "@/*" -> "./*" path alias so tests can import lib modules.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(process.cwd()) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
