import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useCallback, useEffect, useRef, useState } from "@hiogawa/tiny-react";
import { range } from "@hiogawa/utils";
import { HmrChild } from "./hmr";
import { HmrTransform } from "./hmr-transform";

export function App() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-3 p-2 px-4 shadow-md shadow-black/[0.05] dark:shadow-black/[0.4]">
        <h1 className="flex-1 text-lg">tiny-react example</h1>
        <ThemeSelect />
        <a
          className="flex items-center antd-btn antd-btn-ghost"
          href="https://github.com/hi-ogawa/js-utils/pull/144"
          target="_blank"
        >
          <span className="i-ri-github-line w-6 h-6"></span>
        </a>
      </header>
      <div className="flex flex-col gap-4 w-full max-w-xl mx-auto p-4">
        <TestHmr />
        <TestTodoApp />
        <TestProps />
        <TestSetStateInEffect />
        <TestState />
        <TestEffect />
        <TestRef />
        <TestFragment />
      </div>
    </div>
  );
}

function ThemeSelect() {
  const [value, setValue] = useState(() => getTheme());

  return (
    <label className="flex items-center gap-2">
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
      <h1>Test Fragment</h1>
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

function TestState() {
  const [values, setValues] = useState(() => range(3).map((i) => String(i)));

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1 className="text-lg">Test State</h1>
      <div className="flex flex-col gap-2">
        {values.map((value, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span className="text-colorTextSecondary">input ({i})</span>
            <input
              className="antd-input px-1"
              value={value}
              oninput={(e) => {
                setValues((prev) => {
                  prev = [...prev];
                  prev[i] = e.currentTarget.value;
                  return prev;
                });
              }}
            />
          </label>
        ))}
      </div>
      <div className="border-t my-1"></div>
      <pre className="text-sm">debug: {JSON.stringify({ values })}</pre>
    </div>
  );
}

function TestRef() {
  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test Ref</h1>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-colorTextSecondary">
            set default value via ref callback
          </span>
          <input
            className="antd-input px-1"
            ref={useCallback((el: HTMLInputElement | null) => {
              if (el) {
                el.value = "hello";
              }
            }, [])}
          />
        </label>
      </div>
    </div>
  );
}

function TestEffect() {
  const [state, setState] = useState(0);

  const ref1 = useRef(0);
  const ref2 = useRef(0);
  const ref3 = useRef(0);

  useEffect(() => {
    ref1.current += 1;
  }, []);

  useEffect(() => {
    ref2.current += 1;
  });

  useEffect(() => {
    ref3.current += 1;
  }, [state]);

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test Effect</h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span>Counter</span>
          <span className="min-w-[1rem] text-center">{state}</span>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev + 1)}
          >
            +1
          </button>
        </div>
        <div>Effect1 {ref1.current}</div>
        <div>Effect2 {ref2.current}</div>
        <div>Effect3 {ref3.current}</div>
      </div>
    </div>
  );
}

function TestSetStateInEffect() {
  const [state, setState] = useState(0);
  const [state2, setState2] = useState(0);

  const renderCountRef = useRef(0);
  renderCountRef.current++;

  useEffect(() => {
    setState2(2 * state);
  }, [state]);

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test SetState in useEffect</h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev + 1)}
          >
            +1
          </button>
        </div>
        <pre className="text-sm">
          {JSON.stringify({ state, state2, render: renderCountRef.current })}
        </pre>
      </div>
    </div>
  );
}

// cf. https://github.com/adamhaile/surplus#example
function TestTodoApp() {
  interface TodoItem {
    id: string;
    value: string;
    checked: number;
  }

  const [input, setInput] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>(() => [
    {
      id: generateId(),
      value: "hello",
      checked: 1,
    },
    {
      id: generateId(),
      value: "world",
      checked: 0,
    },
  ]);

  function generateId() {
    return Math.random().toString(36).slice(2);
  }

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Todo App</h1>
      <div className="flex flex-col gap-2">
        <form
          className="flex flex-col w-full"
          onsubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) {
              return;
            }
            setInput("");
            setTodos((prev) => [
              {
                id: generateId(),
                value: input,
                checked: 0,
              },
              ...prev,
            ]);
          }}
        >
          <input
            placeholder="new todo..."
            className="antd-input px-2"
            value={input}
            oninput={(e) => setInput(e.currentTarget.value)}
          />
        </form>
        <div className="border-t my-1"></div>
        {todos.length === 0 && (
          <div className="text-colorTextSecondary">No todo...</div>
        )}
        {todos.map((todo, i) => (
          <div key={todo.id} className="flex items-center gap-2">
            <input
              className="flex-1 antd-input px-2"
              value={todo.value}
              oninput={(e) => {
                const value = e.currentTarget.value;
                setTodos((prev) => {
                  prev = prev.slice();
                  prev[i] = { ...prev[i] };
                  prev[i].value = value;
                  return prev;
                });
              }}
            />
            <button
              className={
                "antd-btn antd-btn-ghost w-5 h-5 " +
                (todo.checked
                  ? "i-ri-checkbox-line"
                  : "i-ri-checkbox-blank-line")
              }
              onclick={() => {
                setTodos((prev) => {
                  prev = prev.slice();
                  prev[i] = { ...prev[i] };
                  prev[i].checked ^= 1;
                  return prev;
                });
              }}
            />
            <button
              className="antd-btn antd-btn-ghost i-ri-close-line w-5 h-5"
              onclick={() => {
                setTodos((prev) => {
                  prev = prev.slice();
                  prev.splice(i, 1);
                  return prev;
                });
              }}
            />
          </div>
        ))}
      </div>
      <details className="text-sm">
        <summary>debug</summary>
        <pre>{JSON.stringify({ input, todos }, null, 2)}</pre>
      </details>
    </div>
  );
}

function TestHmr() {
  const [state, setState] = useState(0);

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1 className="text-lg">TestHmr</h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span>Counter = {state}</span>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev + 1)}
          >
            +1
          </button>
        </div>
        <div className="border-t my-1"></div>
        <HmrChild counter={state} />
        <div className="border-t my-1"></div>
        <span>Test multiple instances</span>
        <HmrTransform counter={state} />
        <HmrTransform counter={state} />
      </div>
    </div>
  );
}

function TestProps() {
  const [state, setState] = useState(0);

  return (
    <div className="border p-2 flex flex-col gap-2">
      <h1>Test Props</h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span>Outer State</span>
          <span className="min-w-[1rem] text-center">{state}</span>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev + 1)}
          >
            +1
          </button>
        </div>
        <TestPropsInner value={state} />
      </div>
    </div>
  );
}

function TestPropsInner(props: { value: number }) {
  const [state, setState] = useState(0);

  return (
    <div className="border p-2 flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span>Inner State</span>
          <span className="min-w-[1rem] text-center">{state}</span>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev - 1)}
          >
            -1
          </button>
          <button
            className="antd-btn antd-btn-default px-1"
            onclick={() => setState((prev) => prev + 1)}
          >
            +1
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Props</span>
          <span>{JSON.stringify(props, null, 2)}</span>
        </div>
      </div>
    </div>
  );
}