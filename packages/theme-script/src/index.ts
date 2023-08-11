//
// export raw script
//

// compile time DEFINE (see tsup.config.ts)
declare let __DEFINE_MAIN_CODE: string;

export type ThemeScriptOptions = {
  storageKey?: string;
  defaultTheme?: string;
  noScriptTag?: boolean;
};

// wrapper to set storage key and default
export function generateThemeScript(opts?: ThemeScriptOptions): string {
  return [
    !opts?.noScriptTag && "<script>",
    opts?.storageKey &&
      `window.THEME_SCRIPT_STORAGE_KEY = "${opts.storageKey}";`,
    opts?.defaultTheme &&
      `window.THEME_SCRIPT_DEFAULT = "${opts.defaultTheme}";`,
    __DEFINE_MAIN_CODE,
    !opts?.noScriptTag && "</script>",
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
