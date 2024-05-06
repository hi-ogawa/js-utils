import { useState } from "react";

export function InnerOther(props: { value: number }) {
  const add = 100;
  const [state, setState] = useState(0);
  return (
    <div>
      <div>
        <span style={{ marginRight: "0.5rem" }}>[InnerOther] = {state}</span>
        <button onClick={() => setState((prev) => prev - 1)}>-1</button>
        <button onClick={() => setState((prev) => prev + 1)}>+1</button>
      </div>
      <pre>
        [Outer] + [InnerOther] + {add} = {props.value + state + add}
      </pre>
    </div>
  );
}

export function InnerShowHide() {
  const message = "hello";
  return <div>[{message}]</div>;
}
