import { defineConfig, devices } from "@playwright/test";

const port = 15173;

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
    command: `pnpm dev --port ${port}`,
    port,
    reuseExistingServer: true,
  },
  retries: process.env["CI"] ? 2 : 0,
  forbidOnly: Boolean(process.env["CI"]),
});
