import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useState } from "@hiogawa/tiny-react";
import { useUrl } from "../utils/use-url";

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
        <TestServerUrl />
        <TestEventHandler />
        <TestEdgeCases />
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

function TestEventHandler() {
  const [state, setState] = useState(1);
  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test Event Handler</h1>
      <button
        className="antd-btn antd-btn-primary px-2"
        onclick={() => {
          setState((prev) => prev ^ 1);
        }}
      >
        {state ? "Hello!" : "World!"}
      </button>
    </div>
  );
}

function TestServerUrl() {
  const [url, setUrl] = useUrl();
  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test Server URL</h1>
      <span className="text-colorTextSecondary text-sm">
        See "View source" to verify input value is rendered during SSR
      </span>
      <input
        className="antd-input px-1"
        placeholder="?q=..."
        value={new URL(url).searchParams.get("q") ?? ""}
        oninput={(e) => {
          const newUrl = new URL(url);
          const q = e.currentTarget.value;
          if (q) {
            newUrl.searchParams.set("q", q);
          } else {
            newUrl.searchParams.delete("q");
          }
          setUrl(newUrl.href);
        }}
      />
    </div>
  );
}

function TestEdgeCases() {
  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test edge cases</h1>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-colorTextSecondary flex flex-col gap-1">
            TODO: HTML attributes (e.g. maxLength, readOnly, ...)
          </span>
          <input
            className="antd-input px-1"
            readOnly
            maxLength={8}
            value="hello"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-colorTextSecondary flex flex-col gap-1">
            textarea value
          </span>
          <textarea className="antd-input p-1" value="h<e&l>lo" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-colorTextSecondary flex flex-col gap-1">
            TODO: select value
          </span>
          <select className="antd-input p-1" value="hello">
            <option value="">none</option>
            <option value="hello">hello</option>
            <option value="world">world</option>
          </select>
        </div>
      </div>
    </div>
  );
}
