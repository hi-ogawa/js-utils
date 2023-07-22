import "virtual:uno.css";
import React from "react";
import { createRoot } from "react-dom/client";

main();

function main() {
  const el = document.getElementById("root");
  const reactRoot = createRoot(el!);
  reactRoot.render(<Root />);
}

function Root() {
  const rerender = React.useReducer((prev) => !prev, true)[1];

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-[350px] max-w-full flex flex-col gap-2">
        <div className="flex justify-between">
          Theme
          <span className="light:i-ri-sun-line dark:i-ri-moon-line !w-5 !h-5"></span>
        </div>
        <div id="theme-select" className="flex gap-2">
          {["system", "light", "dark"].map((theme) => (
            <button
              key={theme}
              className="flex-1 antd-btn antd-btn-default capitalize aria-selected:(text-colorPrimaryActive border-colorPrimaryActive)"
              aria-selected={__themeGet() === theme}
              onClick={() => {
                __themeSet(theme);
                rerender();
              }}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

declare let __themeGet: () => string;
declare let __themeSet: (v: string) => void;
