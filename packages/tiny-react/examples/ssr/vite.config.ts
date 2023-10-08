import { themeScriptPlugin } from "@hiogawa/theme-script/dist/vite";
import { tinyReactVitePlugin } from "@hiogawa/tiny-react/dist/plugins/vite";
import { importDevServerPlugin } from "@hiogawa/vite-import-dev-server";
import { vaviteConnect } from "@vavite/connect";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig((ctx) => ({
  plugins: [
    unocss(),
    tinyReactVitePlugin(),
    themeScriptPlugin({ defaultTheme: "light" }),
    importDevServerPlugin(),
    vaviteConnect({
      standalone: false,
      serveClientAssetsInDev: true,
      handlerEntry:
        process.env["SERVER_ENTRY"] ?? "./src/server/adapter-node.ts",
    }),
  ],
  build: {
    outDir: ctx.ssrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
  },
}));
