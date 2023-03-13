import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// based on https://github.com/vitest-dev/vitest/blob/1fe8286c790cef9063b1f5f8147f6d41fc14bf79/examples/react-testing-lib/vite.config.ts

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
