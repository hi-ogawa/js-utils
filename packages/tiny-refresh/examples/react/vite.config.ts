import { vitePluginTinyRefresh } from "@hiogawa/tiny-refresh/dist/vite";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    unocss() as any,
    vitePluginTinyRefresh({
      debug: true,
    }),
  ],
  clearScreen: false,
});
