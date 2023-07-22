import { THEME_SCRIPT } from "@hiogawa/theme-script";
import unocss from "unocss/vite";
import { Plugin, defineConfig } from "vite";

export default defineConfig({
  plugins: [unocss(), injectThemeScriptPlugin()],
  clearScreen: false,
});

// inject theme initialization script
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
