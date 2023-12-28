import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src",
    poolMatchGlobs: [["**/runner.test.ts", "forks"]],
  },
});
