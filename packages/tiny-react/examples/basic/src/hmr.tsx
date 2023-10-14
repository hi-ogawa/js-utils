import { useState } from "@hiogawa/tiny-react";

export function HmrChild(props: { name: string; counter: number }) {
  const [state, setState] = useState(0);
  const add = 1000;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span>
          {props.name} = {state}
        </span>
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
      <span>
        parent + {props.name} = {add} = {props.counter + state + add}
      </span>
    </div>
  );
}
