"use client";

import { useEffect, useState } from "@hiogawa/tiny-react";

export function ClientComponent() {
  const [count, setCount] = useState(0);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div data-testid="client-component">
      <h4>Hello Client Component</h4>
      <div data-hydrated={hydrated}>[hydrated: {String(hydrated)}]</div>
      <div>Count: {count}</div>
      <button className="client-btn" onclick={() => setCount((v) => v - 1)}>
        -1
      </button>
      <button className="client-btn" onclick={() => setCount((v) => v + 1)}>
        +1
      </button>
      <div></div>
    </div>
  );
}
export function InterleaveComponent(props: { serverNode: any }) {
  return (
    <div data-testid="interleave-component">
      <h4>{"Interleave server -> client -> server"}</h4>
      <div>props.serverNode: {props.serverNode}</div>
    </div>
  );
}

// TODO: tranform
Object.assign(ClientComponent, { $$id: "ClientComponent" });
Object.assign(InterleaveComponent, { $$id: "InterleaveComponent" });
