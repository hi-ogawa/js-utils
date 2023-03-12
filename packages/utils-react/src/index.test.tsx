import React from "react";
import reactTestRenderer from "react-test-renderer";
import { describe, expect, it } from "vitest";
import { Compose } from "./compose";
import { Debug } from "./debug";
import { useStableRef } from "./misc";

describe("Debug", () => {
  it("basic", () => {
    const el = <Debug debug={{ hello: "world" }} />;
    expect(render(el)).toMatchInlineSnapshot(`
      <details>
        <summary
          onClick={[Function]}
        >
          debug
        </summary>
        <pre>
          {
        "hello": "world"
      }
        </pre>
      </details>
    `);
  });
});

describe("Compose", () => {
  it("basic", () => {
    function Wrapper(props: JSX.IntrinsicElements["div"]) {
      return <div {...props}>{props.children}</div>;
    }

    const el = (
      <Compose
        elements={[
          <Wrapper className="wrapper-1" />,
          <Wrapper className="wrapper-2" />,
          <button>inner</button>,
        ]}
      />
    );

    expect(render(el)).toMatchInlineSnapshot(`
      <div
        className="wrapper-1"
      >
        <div
          className="wrapper-2"
        >
          <button />
        </div>
      </div>
    `);
  });
});

describe("useStableRef", () => {
  it("basic", () => {
    function useInterval(ms: number, callback: () => void) {
      const handlerRef = useStableRef(callback);

      React.useEffect(() => {
        const subscription = setInterval(() => {
          handlerRef.current();
        }, ms);
        return () => {
          clearInterval(subscription);
        };
      }, []);
    }

    function Component() {
      const [count, setCount] = React.useState(0);

      useInterval(1000, () => setCount((c) => c + 1));

      return <div>count={count}</div>;
    }

    let el = <Component />;

    expect(render(el)).toMatchInlineSnapshot(`
      <div>
        count=
        0
      </div>
    `);
  });
});

function render(el: React.ReactElement) {
  return reactTestRenderer.create(el).toJSON();
}
