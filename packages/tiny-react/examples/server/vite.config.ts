import { resolve } from "path";
import { tinyReactVitePlugin } from "@hiogawa/tiny-react/dist/plugins/vite";
import {
  vitePluginLogger,
  vitePluginSsrMiddleware,
} from "@hiogawa/vite-plugin-ssr-middleware";
import { defineConfig } from "vite";

export default defineConfig((env) => ({
  clearScreen: false,
  plugins: [
    tinyReactVitePlugin(),
    vitePluginLogger(),
    vitePluginSsrMiddleware({
      entry: process.env["SERVER_ENTRY"] ?? "/src/adapters/node.ts",
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
    outDir: env.isSsrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
    minify: false,
  },
}));
