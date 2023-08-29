import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src",
    // for `process.chdir` in `setupTestFixture`
    poolMatchGlobs: [["**/*", "child_process"]],
  },
});
