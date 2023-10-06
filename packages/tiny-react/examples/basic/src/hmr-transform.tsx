import { useState } from "@hiogawa/tiny-react";

// @hmr-unsafe
export function HmrTransform(props: { counter: number }) {
  const [state, setState] = useState(0);
  const add = 100;
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg">
        HmrChild{" "}
        <span className="text-colorTextSecondary text-sm">
          (via vite plugin transform)
        </span>
      </h2>
      <span>
        Parent Counter + {add} = {props.counter + add}
      </span>
      <div className="flex items-center gap-2">
        <span>Child Counter = {state}</span>
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
    </div>
  );
}
