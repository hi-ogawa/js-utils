const themeApi = window as any as {
  THEME_SCRIPT_STORAGE_KEY: string;
  THEME_SCRIPT_DEFAULT: string;
  THEME_SCRIPT_SET: (theme: string) => void;
  THEME_SCRIPT_GET: () => string;
};

themeApi.THEME_SCRIPT_STORAGE_KEY ??= "theme";
themeApi.THEME_SCRIPT_DEFAULT ??= "system";
themeApi.THEME_SCRIPT_GET = getTheme;
themeApi.THEME_SCRIPT_SET = setTheme;

const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getTheme() {
  return (
    window.localStorage.getItem(themeApi.THEME_SCRIPT_STORAGE_KEY) ||
    themeApi.THEME_SCRIPT_DEFAULT
  );
}

function setTheme(theme: string) {
  window.localStorage.setItem(themeApi.THEME_SCRIPT_STORAGE_KEY, theme);
  applyTheme();
}

function applyTheme() {
  const theme = getTheme();
  const derived =
    theme === "system" ? (prefersDarkQuery.matches ? "dark" : "light") : theme;
  disableTransitions(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(derived);
    document.documentElement.dataset["theme"] = theme;
    document.documentElement.dataset["themeDerived"] = derived;
  });
}

// https://paco.me/writing/disable-theme-transitions
function disableTransitions(callback: () => void) {
  const el = document.createElement("style");
  el.innerHTML = "* { transition: none !important; }";
  document.head.appendChild(el);
  callback();
  window.getComputedStyle(document.documentElement).transition; // force repaint
  document.head.removeChild(el);
}

function main() {
  applyTheme();
  prefersDarkQuery.addEventListener("change", () => applyTheme());
}

main();
