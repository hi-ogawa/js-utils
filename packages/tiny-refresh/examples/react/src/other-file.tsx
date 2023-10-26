import { useState } from "react";

export function InnerOther(props: { value: number }) {
  const add = 100;
  const [inner, setState] = useState(0);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        inner2 = {inner}
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
      <pre>
        (outer) + (inner2) + {add} = {props.value + inner + add}
      </pre>
    </div>
  );
}

export function InnerShowHide() {
  const message = "hey";
  console.log("[render] InnerShowHide", message);
  return <div>{message}</div>;
}
