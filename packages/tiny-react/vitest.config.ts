import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src",
    environment: "jsdom",
    alias: {
      "@hiogawa/tiny-react/jsx-dev-runtime": resolve(
        "src/helper/jsx-runtime.ts"
      ),
    },
  },
});
