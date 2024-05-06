import { useState } from "react";
import { InnerShowHide } from "./other-file";

export function Root() {
  return (
    <div>
      <input style={{ marginBottom: "0.5rem" }} placeholder="test-input" />
      <Outer />
      <ShowHideContainer />
    </div>
  );
}

function Outer() {
  const [state, setState] = useState(0);
  return (
    <div>
      <div>
        <span style={{ marginRight: "0.5rem" }}>[Outer] = {state}</span>
        <button onClick={() => setState((prev) => prev - 1)}>-1</button>
        <button onClick={() => setState((prev) => prev + 1)}>+1</button>
      </div>
      <div id="inner1">
        <Inner value={state} />
      </div>
      <div id="inner2">
        <Inner value={state} />
      </div>
    </div>
  );
}

function ShowHideContainer() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        style={{ marginRight: "0.5rem" }}
        onClick={() => setShow((prev) => !prev)}
      >
        show/hide
      </button>
      <span data-testid="show-hide-message">[{show && <InnerShowHide />}]</span>
    </div>
  );
}

function Inner(props: { value: number }) {
  const innerAdd = 100;
  return (
    <pre>
      Inner: [Outer] + {innerAdd} = {props.value + innerAdd}
    </pre>
  );
}
