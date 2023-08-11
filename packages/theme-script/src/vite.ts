import { type Plugin } from "vite";
import { type ThemeScriptOption, generateThemeScript } from ".";

// inject raw script into html head to initialize style as early as possible
export function themeScriptPlugin(options?: ThemeScriptOption): Plugin {
  return {
    name: "@hiogawa/theme-script:vite-plugin",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: generateThemeScript(options),
        },
      ];
    },
  };
}
