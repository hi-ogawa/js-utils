import { useState } from "react";
import { InnerOther } from "./other-file";

export function Root() {
  return (
    <div>
      <header className="mb-2 p-2 px-4 shadow-md">tiny-refresh demo</header>
      <div className="flex flex-col w-full max-w-xl mx-auto p-4">
        <Outer />
      </div>
    </div>
  );
}

export function Outer() {
  const [state, setState] = useState(0);
  return (
    <div className="flex flex-col gap-2 border p-4">
      <h1>Outer</h1>
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
      <div id="inner1">
        <Inner value={state} />
      </div>
      <div id="inner2">
        <Inner value={state} />
      </div>
      <div id="inner3">
        <InnerOther value={state} />
      </div>
    </div>
  );
}

export function Inner(props: { value: number }) {
  const add = 100;
  return (
    <pre>
      Inner: counter + {add} = {props.value + add}
    </pre>
  );
}
