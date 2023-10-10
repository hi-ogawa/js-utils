import { useState } from "react";

export function Root() {
  return (
    <div>
      <header className="mb-2 p-2 px-4 shadow-md">tiny-refresh demo</header>
      <div className="flex flex-col w-full max-w-xl mx-auto mt-4 border p-4">
        <State />
      </div>
    </div>
  );
}

export function State() {
  const [state, setState] = useState(0);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <button
          className="antd-btn antd-btn-default px-1"
          onClick={() => setState((prev) => prev - 1)}
        >
          -1
        </button>
        <button
          className="antd-btn antd-btn-default px-1"
          onClick={() => setState((prev) => prev + 1)}
        >
          +1
        </button>
      </div>
      <StateInner value={state} />
      <StateInner value={state} />
    </div>
  );
}

export function StateInner(props: { value: number }) {
  const add = 100;
  return (
    <pre>
      props.value + {add} = {props.value + add}
    </pre>
  );
}
