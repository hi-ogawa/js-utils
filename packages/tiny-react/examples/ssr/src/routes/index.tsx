import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useState } from "@hiogawa/tiny-react";

// @hmr
export function Root() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-3 p-2 px-4 shadow-md shadow-black/[0.05] dark:shadow-black/[0.4]">
        <h1 className="flex-1 text-lg">tiny-react ssr</h1>
        <ThemeSelect />
        <a
          className="flex items-center antd-btn antd-btn-ghost"
          href="https://github.com/hi-ogawa/js-utils/pull/150"
          target="_blank"
        >
          <span className="i-ri-github-line w-6 h-6"></span>
        </a>
      </header>
      <div className="flex flex-col gap-4 w-full max-w-xl mx-auto p-4">
        <Demo />
      </div>
    </div>
  );
}

function ThemeSelect() {
  return (
    <button
      className="antd-btn antd-btn-ghost light:i-ri-moon-line dark:i-ri-sun-line !w-6 !h-6"
      onclick={() => setTheme(getTheme() === "dark" ? "light" : "dark")}
    ></button>
  );
}

function Demo() {
  const [state, setState] = useState(1);
  return (
    <button
      className="antd-btn antd-btn-primary px-2"
      onclick={() => {
        // TODO: event handler not working...
        setState((prev) => prev ^ 1);
      }}
    >
      {state ? "Hello!" : "World!"}
    </button>
  );
}
