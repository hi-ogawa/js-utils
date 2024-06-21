import { defineConfig, devices } from "@playwright/test";

const port = 15173;
const command = Boolean(process.env["E2E_WEBPACK"])
  ? `pnpm dev-webpack --port ${port}`
  : `pnpm dev --port ${port}`;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: null,
        deviceScaleFactor: undefined,
      },
    },
  ],
  webServer: {
    command,
    port,
    reuseExistingServer: true,
  },
  retries: process.env["CI"] ? 2 : 0,
  forbidOnly: Boolean(process.env["CI"]),
});
