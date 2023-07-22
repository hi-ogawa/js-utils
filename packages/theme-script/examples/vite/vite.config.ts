import { THEME_SCRIPT } from "@hiogawa/theme-script";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import { Plugin, defineConfig } from "vite";

export default defineConfig({
  plugins: [unocss(), react(), injectThemeScriptPlugin()],
  clearScreen: false,
});

// inject raw script into html head to initialize style as early as possible
function injectThemeScriptPlugin(): Plugin {
  return {
    name: "local:" + injectThemeScriptPlugin.name,
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: `
            globalThis.__themeStorageKey = "theme-script-vite:theme";
            ${THEME_SCRIPT}
          `,
        },
      ];
    },
  };
}
