import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useState } from "@hiogawa/tiny-react";

export function App() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 p-2 px-4">
        <h1 className="flex-1 text-lg">tiny-react test</h1>
        <ThemeSelect />
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
        <TestFragment />
        <TestForm />
      </div>
    </div>
  );
}

function ThemeSelect() {
  const [value, setValue] = useState(() => getTheme());

  return (
    <label className="flex gap-2">
      Theme
      <select
        className="antd-input px-1"
        value={value}
        onchange={(e) => {
          setTheme(e.currentTarget.value);
          setValue(e.currentTarget.value);
        }}
      >
        <option value="system">System</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </label>
  );
}

function TestFragment() {
  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>{TestFragment.name}</h1>
      <div>
        <>
          <>string</>
          <>
            {"number"} {0} {1}
            {["arr", "ay"]}
          </>
        </>
      </div>
    </div>
  );
}

function TestForm() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1 className="text-lg">{TestForm.name}</h1>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-colorTextSecondary">input</span>
          <input
            className="antd-input p-1"
            value={inputValue}
            oninput={(e) => {
              setInputValue(e.currentTarget.value);
            }}
          />
        </label>
      </div>
      <details>
        <pre>{JSON.stringify({ inputValue })}</pre>
      </details>
    </div>
  );
}
