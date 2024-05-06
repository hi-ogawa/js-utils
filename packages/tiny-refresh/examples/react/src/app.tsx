import { useState } from "react";
import { InnerOther, InnerShowHide } from "./other-file";

export function Root() {
  return (
    <div>
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
      <div id="inner3">
        <InnerOther value={state} />
      </div>
    </div>
  );
}

function ShowHideContainer() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow((prev) => !prev)}>show/hide</button>
      {show && <InnerShowHide />}
    </div>
  );
}

function Inner(props: { value: number }) {
  const add = 100;
  return (
    <pre>
      Inner: [Outer] + {add} = {props.value + add}
    </pre>
  );
}
