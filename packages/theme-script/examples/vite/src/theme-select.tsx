/// <reference types="@hiogawa/theme-script/types" />
// above "types" reference exposes __themeGet and __themeSet

import React from "react";

export function ThemeSelect() {
  const rerender = React.useReducer((prev) => !prev, true)[1];

  return (
    <div className="flex gap-2">
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
  );
}
