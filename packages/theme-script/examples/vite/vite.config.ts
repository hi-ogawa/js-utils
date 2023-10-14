import { themeScriptPlugin } from "@hiogawa/theme-script/dist/vite";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    unocss(),
    themeScriptPlugin({ storageKey: "theme-script-vite:theme" }),
  ],
  clearScreen: false,
});
