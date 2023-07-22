import "virtual:uno.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeSelect } from "./theme-select";

main();

function main() {
  const el = document.getElementById("root");
  const reactRoot = createRoot(el!);
  reactRoot.render(<Root />);
}

function Root() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-[350px] max-w-full flex flex-col gap-2">
        <div className="flex justify-between">
          Theme
          <span className="light:i-ri-sun-line dark:i-ri-moon-line !w-5 !h-5"></span>
        </div>
        <ThemeSelect />
      </div>
    </div>
  );
}
