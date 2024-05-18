import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    // transpile `using`
    target: "es2022",
  },
});
