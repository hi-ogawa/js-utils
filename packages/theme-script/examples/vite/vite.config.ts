import fs from "node:fs";
import unocss from "unocss/vite";
import { Plugin, defineConfig } from "vite";

export default defineConfig({
  plugins: [unocss(), injectThemeScriptPlugin()],
  clearScreen: false,
});

// inject theme initialization script
function injectThemeScriptPlugin(): Plugin {
  const script = fs.readFileSync(
    // need to prevent vite/esbuild from statically analyzing `require.resolve`
    // TODO: what if `"type": "module"` in package.json?
    require["resolve"]("@hiogawa/theme-script"),
    "utf-8"
  );
  return {
    name: "local:" + injectThemeScriptPlugin.name,
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: `
            globalThis.__themeStorageKey = "theme-script-vite:theme";
            ${script}
          `,
        },
      ];
    },
  };
}
