import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src",
    pool: "forks",
  },
});
