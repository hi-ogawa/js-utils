import { useEffect, useState } from "@hiogawa/tiny-react";
import type { JSX } from "@hiogawa/tiny-react/jsx-runtime";

// @hmr-unsafe
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
    </div>
  );
}

export function InterleaveComponent(props: { serverNode: JSX.Element }) {
  return (
    <div data-testid="interleave-component">
      <h4>Interleave server and client</h4>
      <div>{props.serverNode}</div>
      <div>
        <ClientNode serverNode={props.serverNode} />
      </div>
    </div>
  );
}

export function ClientNode(props: { serverNode: JSX.Element }) {
  return <span>[props.serverNode: {props.serverNode}]</span>;
}
