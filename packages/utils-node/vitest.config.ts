import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    supported: {
      using: false,
    },
  },
  test: {
    pool: "forks",
  },
});
