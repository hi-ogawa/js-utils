import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src",
    // worker thread doesn't support `process.chdir` in `setupTestFixture`.
    // we see `ERR_IPC_CHANNEL_CLOSED` when exiting watch mode, but it looks okay otherwise.
    poolMatchGlobs: [["**/*", "child_process"]],
  },
});
