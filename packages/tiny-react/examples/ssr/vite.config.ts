import { themeScriptPlugin } from "@hiogawa/theme-script/dist/vite";
import { tinyReactVitePlugin } from "@hiogawa/tiny-react/vite";
import { importDevServerPlugin } from "@hiogawa/vite-import-dev-server";
import { viteNullExportPlugin } from "@hiogawa/vite-null-export";
import {
  vitePluginLogger,
  vitePluginSsrMiddleware,
} from "@hiogawa/vite-plugin-ssr-middleware";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig((ctx) => ({
  clearScreen: false,
  plugins: [
    unocss(),
    tinyReactVitePlugin(),
    themeScriptPlugin({ defaultTheme: "light" }),
    importDevServerPlugin(),
    viteNullExportPlugin({
      serverOnly: "**/server/**",
    }),
    vitePluginLogger(),
    vitePluginSsrMiddleware({
      entry: process.env["SERVER_ENTRY"] ?? "./src/server/adapter-node.ts",
    }),
  ],
  build: {
    outDir: ctx.isSsrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
  },
}));
