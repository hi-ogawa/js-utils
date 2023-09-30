import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useState } from "@hiogawa/tiny-react";

export function App() {
  return (
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2 p-2 px-4">
        <h1 class="flex-1 text-lg">tiny-react test</h1>
        <ThemeSelect />
      </div>
      <div class="flex flex-col gap-4 w-full max-w-xl mx-auto">
        <TestFragment />
        <TestForm />
      </div>
    </div>
  );
}

function ThemeSelect() {
  const [value, setValue] = useState(() => getTheme());

  return (
    <label class="flex gap-2">
      Theme
      <select
        class="antd-input px-1"
        value={value}
        onChange={(e: any) => {
          const newValue = e.currentTarget.value;
          setTheme(newValue);
          setValue(newValue);
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
    <div class="border p-2 flex flex-col gap-2">
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
    <div class="border p-2 flex flex-col gap-2">
      <h1 class="text-lg">{TestForm.name}</h1>
      <div class="flex flex-col gap-2">
        <label class="flex flex-col gap-1">
          <span class="text-colorTextSecondary">input</span>
          <input
            class="antd-input p-1"
            value={inputValue}
            // no support for react-like special onChange semantics...
            onInput={(e: any) => {
              console.log(e.currentTarget.value);
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
