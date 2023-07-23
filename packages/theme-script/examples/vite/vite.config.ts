import { themeScriptPlugin } from "@hiogawa/theme-script/dist/vite";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    unocss(),
    react(),
    themeScriptPlugin({ storageKey: "theme-script-vite:theme" }),
  ],
  clearScreen: false,
});
