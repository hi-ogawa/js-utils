import { getTheme, setTheme } from "@hiogawa/theme-script";
import { useCallback, useEffect, useRef, useState } from "@hiogawa/tiny-react";
import { range } from "@hiogawa/utils";
import { HmrChild } from "./hmr";

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
        <TestTodoApp />
        <TestHmr />
        <TestProps />
        <TestSetStateInEffect />
        <TestState />
        <TestEffect />
        <TestRef />
        <TestFragment />
        <TestSvg />
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
// @hmr-unsafe
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
          <span>parent = {state}</span>
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
        <HmrChild name="child1" counter={state} />
        <div className="border-t my-1"></div>
        <HmrChild name="child2" counter={state} />
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

function TestSvg() {
  return (
    <div className="border p-2 flex flex-col gap-1">
      <h1>Test SVG</h1>
      <div className="flex flex-col gap-2 p-1">
        <span className="text-sm text-colorTextSecondary">
          `Document.createElementNS` trick is not implemented. But, simple svg
          can be injectd via `Element.innerHTML` using ref callback.
        </span>
        <div
          className="flex gap-2 justify-center"
          ref={(el) => {
            if (el && !el.innerHTML) {
              el.innerHTML = `
                <svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM8 13H16C16 15.2091 14.2091 17 12 17C9.79086 17 8 15.2091 8 13ZM8 11C7.17157 11 6.5 10.3284 6.5 9.5C6.5 8.67157 7.17157 8 8 8C8.82843 8 9.5 8.67157 9.5 9.5C9.5 10.3284 8.82843 11 8 11ZM16 11C15.1716 11 14.5 10.3284 14.5 9.5C14.5 8.67157 15.1716 8 16 8C16.8284 8 17.5 8.67157 17.5 9.5C17.5 10.3284 16.8284 11 16 11Z"></path></svg>
                <svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C16.6944 2 20.5 5.80558 20.5 10.5C20.5 17 15 22.5 12 22.5C9 22.5 3.5 17 3.5 10.5C3.5 5.80558 7.30558 2 12 2ZM12 4C8.41015 4 5.5 6.91015 5.5 10.5C5.5 15.2938 9.665 20.5 12 20.5C14.335 20.5 18.5 15.2938 18.5 10.5C18.5 6.91015 15.5899 4 12 4ZM17.5 11C17.6603 11 17.8186 11.0084 17.9746 11.0247C17.9916 11.1812 18 11.3396 18 11.5C18 13.9853 15.9853 16 13.5 16C13.3396 16 13.1812 15.9916 13.0252 15.9752C13.0084 15.8186 13 15.6603 13 15.5C13 13.0147 15.0147 11 17.5 11ZM6.5 11C8.98528 11 11 13.0147 11 15.5C11 15.6603 10.9916 15.8186 10.9753 15.9746C10.8186 15.9916 10.6603 16 10.5 16C8.01472 16 6 13.9853 6 11.5C6 11.3396 6.00839 11.1812 6.02475 11.0252C6.18121 11.0084 6.33963 11 6.5 11Z"></path></svg>
                <svg class="w-6 h-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C16.9706 2 21 6.02944 21 11V18.5C21 20.433 19.433 22 17.5 22C16.3001 22 15.2413 21.3962 14.6107 20.476C14.0976 21.3857 13.1205 22 12 22C10.8795 22 9.9024 21.3857 9.38728 20.4754C8.75869 21.3962 7.69985 22 6.5 22C4.63144 22 3.10487 20.5357 3.00518 18.692L3 18.5V11C3 6.02944 7.02944 2 12 2ZM12 4C8.21455 4 5.1309 7.00478 5.00406 10.7593L5 11L4.99927 18.4461L5.00226 18.584C5.04504 19.3751 5.70251 20 6.5 20C6.95179 20 7.36652 19.8007 7.64704 19.4648L7.73545 19.3478C8.57033 18.1248 10.3985 18.2016 11.1279 19.4904C11.3053 19.8038 11.6345 20 12 20C12.3651 20 12.6933 19.8044 12.8687 19.4934C13.5692 18.2516 15.2898 18.1317 16.1636 19.2151L16.2606 19.3455C16.5401 19.7534 16.9976 20 17.5 20C18.2797 20 18.9204 19.4051 18.9931 18.6445L19 18.5V11C19 7.13401 15.866 4 12 4ZM12 12C13.1046 12 14 13.1193 14 14.5C14 15.8807 13.1046 17 12 17C10.8954 17 10 15.8807 10 14.5C10 13.1193 10.8954 12 12 12ZM9.5 8C10.3284 8 11 8.67157 11 9.5C11 10.3284 10.3284 11 9.5 11C8.67157 11 8 10.3284 8 9.5C8 8.67157 8.67157 8 9.5 8ZM14.5 8C15.3284 8 16 8.67157 16 9.5C16 10.3284 15.3284 11 14.5 11C13.6716 11 13 10.3284 13 9.5C13 8.67157 13.6716 8 14.5 8Z"></path></svg>
              `;
            }
          }}
        />
      </div>
    </div>
  );
}
