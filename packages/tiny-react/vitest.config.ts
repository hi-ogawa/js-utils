import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src",
    environment: "happy-dom",
    alias: {
      "@hiogawa/tiny-react/jsx-dev-runtime": resolve(
        "src/helper/jsx-runtime.ts"
      ),
    },
  },
});
