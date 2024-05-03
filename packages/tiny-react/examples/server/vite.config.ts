import { resolve } from "path";
import { vitePluginSsrMiddleware } from "@hiogawa/vite-plugin-ssr-middleware";
import { defineConfig } from "vite";

export default defineConfig((ctx) => ({
  clearScreen: false,
  plugins: [
    vitePluginSsrMiddleware({
      entry: process.env["SSR_ENTRY"] ?? "/src/adapter/node.ts",
      preview: resolve("dist/server/index.js"),
    }),
    {
      name: "global-vite-server",
      configureServer(server) {
        (globalThis as any).__vite_server = server;
      },
    },
  ],
  build: {
    outDir: ctx.isSsrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
    minify: false,
  },
}));
