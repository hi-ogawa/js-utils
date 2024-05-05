import { vitePluginSsrMiddleware } from "@hiogawa/vite-plugin-ssr-middleware";
import { defineConfig } from "vite";

export default defineConfig({
  clearScreen: false,
  plugins: [
    vitePluginSsrMiddleware({
      entry: "/src/server.ts",
    }),
  ],
});
