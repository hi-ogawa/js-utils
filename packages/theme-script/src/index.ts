// export raw script (see tsup.config.ts)
declare let __DEFINE_MAIN_CODE: string;

export const THEME_SCRIPT = __DEFINE_MAIN_CODE;

// export THEME_SCRIPT_SET/GET
export const setTheme: (theme: string) => void =
  typeof window !== "undefined" && (window as any).THEME_SCRIPT_SET;

export const getTheme: () => string =
  typeof window !== "undefined" && (window as any).THEME_SCRIPT_GET;
