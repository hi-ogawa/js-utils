import path from "node:path";
import { tinyReactVitePlugin } from "@hiogawa/tiny-react/vite";
import {
  vitePluginLogger,
  vitePluginSsrMiddleware,
} from "@hiogawa/vite-plugin-ssr-middleware";
import { defineConfig } from "vite";
import { vitePluginClientReference } from "./src/integration/client-reference/plugin";

export default defineConfig((env) => ({
  clearScreen: false,
  plugins: [
    tinyReactVitePlugin(),
    vitePluginClientReference(),
    vitePluginLogger(),
    vitePluginSsrMiddleware({
      entry: process.env["SERVER_ENTRY"] ?? "/src/adapters/node.ts",
      preview: path.resolve("dist/server/index.js"),
    }),
    {
      name: "global-vite-server",
      configureServer(server) {
        (globalThis as any).__vite_server = server;
      },
    },
  ],
  build: {
    outDir: env.isSsrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
    manifest: true,
    minify: false,
  },
}));
