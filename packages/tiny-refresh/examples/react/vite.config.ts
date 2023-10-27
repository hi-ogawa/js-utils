import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/dist/vite";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [unocss(), vitePluginTinyRefresh()],
  clearScreen: false,
  esbuild: {
    // `jsxDev` mode injects `lineNumber` etc...
    // which might affect tiny-refresh's `Function.toString` check and cause redundant refresh.
    // Depending on the use case, disabling jsxDev entirely might be reasonable.
    // jsxDev: false,
  },
});
