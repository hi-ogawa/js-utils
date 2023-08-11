//
// export raw script
//

// compile time DEFINE (see tsup.config.ts)
declare let __DEFINE_MAIN_CODE: string;

export type ThemeScriptOption = {
  storageKey?: string;
  defaultTheme?: string;
};

// wrapper to set storage key and default
export function generateThemeScript(options?: ThemeScriptOption): string {
  return [
    options?.storageKey &&
      `window.THEME_SCRIPT_STORAGE_KEY = "${options.storageKey}"`,
    options?.defaultTheme &&
      `window.THEME_SCRIPT_DEFAULT = "${options.defaultTheme}"`,
    __DEFINE_MAIN_CODE,
  ]
    .filter(Boolean)
    .join("\n");
}

//
// export window.THEME_SCRIPT_SET/GET
//

export const setTheme: (theme: string) => void =
  typeof window !== "undefined" && (window as any).THEME_SCRIPT_SET;

export const getTheme: () => string =
  typeof window !== "undefined" && (window as any).THEME_SCRIPT_GET;
