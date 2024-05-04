import { useEffect, useState } from "@hiogawa/tiny-react";
import type { JSX } from "@hiogawa/tiny-react/jsx-runtime";

// @hmr-unsafe
export function ClientComponent() {
  const [count, setCount] = useState(0);

  return (
    <div data-testid="client-component">
      <h4>Hello Client Component</h4>
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

// cf. https://github.com/hi-ogawa/vite-plugins/blob/e8d88a6fd6414ec400d64ba6e85d9223a93d0dbf/packages/react-server/src/lib/client/link.tsx
export function Link(props: JSX.IntrinsicElements["a"]) {
  return (
    <a
      onclick={(e) => {
        const target = e.currentTarget.target;
        if (
          e.button === 0 &&
          !(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) &&
          (!target || target === "_self")
        ) {
          e.preventDefault();
          history.pushState(null, "", e.currentTarget.href);
        }
      }}
      {...props}
    />
  );
}

export function Hydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return <span>[hydrated: {String(hydrated)}]</span>;
}
