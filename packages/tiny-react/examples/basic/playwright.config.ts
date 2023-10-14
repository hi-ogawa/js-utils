/// <reference types="node" />
import { defineConfig } from "@playwright/test";

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
        browserName: "chromium",
        // https://github.com/microsoft/playwright/issues/1086#issuecomment-592227413
        viewport: null, // adapt to browser window size specified below
        launchOptions: {
          args: ["--window-size=600,800"],
        },
      },
    },
  ],
  webServer: {
    port,
    command: `pnpm dev:vite --port ${port}`,
    reuseExistingServer: true,
  },
  retries: process.env.CI ? 2 : 0,
  forbidOnly: Boolean(process.env.CI),
});
