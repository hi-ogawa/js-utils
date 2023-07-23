import { type Plugin } from "vite";
import { THEME_SCRIPT } from ".";

// inject raw script into html head to initialize style as early as possible
export function themeScriptPlugin(options?: {
  storageKey?: string;
  defaultTheme?: string;
}): Plugin {
  return {
    name: "@hiogawa/theme-script:vite-plugin",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: [
            options?.storageKey &&
              `window.THEME_SCRIPT_STORAGE_KEY = "${options.storageKey}"`,
            options?.defaultTheme &&
              `window.THEME_SCRIPT_DEFAULT = "${options.defaultTheme}"`,
            THEME_SCRIPT,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ];
    },
  };
}
