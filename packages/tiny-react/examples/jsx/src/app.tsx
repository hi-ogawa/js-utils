import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useState } from "@hiogawa/tiny-react";

export function App() {
  return (
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2 p-2 px-4">
        <h1 class="flex-1 text-lg">tiny-react test</h1>
        <ThemeSelect />
      </div>
      <div class="flex flex-col gap-4 w-full max-w-2xl mx-auto">
        <TestFragment />
        <TestForm />
      </div>
    </div>
  );
}

function ThemeSelect() {
  const [value, setValue] = useState(getTheme());

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
          <>hello</>
          <>
            {0} {1}
          </>
        </>
      </div>
    </div>
  );
}

function TestForm() {
  // input
  // textarea
  // select
  return (
    <div class="border p-2 flex flex-col gap-2">
      <h1>{TestForm.name}</h1>
      <div>TODO</div>
    </div>
  );
}
