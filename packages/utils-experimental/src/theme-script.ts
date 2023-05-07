const themeApi = globalThis as unknown as {
  // user config
  __themeStorageKey?: string;
  __themeDefault?: string;
  // exposed api
  __themeSet: (theme: string) => void;
  __themeGet: () => string;
};

const key = themeApi.__themeStorageKey ?? "theme-script";
const defaultTheme = themeApi.__themeDefault ?? "system";
const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getTheme() {
  return window.localStorage.getItem(key) || defaultTheme;
}

function setTheme(theme: string) {
  window.localStorage.setItem(key, theme);
  applyTheme();
}

function applyTheme() {
  const theme = getTheme();
  const derived =
    theme === "system" ? (prefersDarkQuery.matches ? "dark" : "light") : theme;
  disableTransitions(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(derived);
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

function initTheme() {
  applyTheme();
  prefersDarkQuery.addEventListener("change", applyTheme);
  themeApi.__themeGet = getTheme;
  themeApi.__themeSet = setTheme;
}

initTheme();
