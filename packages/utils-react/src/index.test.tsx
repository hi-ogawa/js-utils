import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { Compose } from "./compose";
import { Debug } from "./debug";
import { usePrevious, useStableRef } from "./misc";
import { renderToJson } from "./test/helper";

describe("Debug", () => {
  it("basic", () => {
    const el = <Debug debug={{ hello: "world" }} />;
    expect(renderToJson(el)).toMatchInlineSnapshot(`
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

    expect(renderToJson(el)).toMatchInlineSnapshot(`
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
  // TODO
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

    expect(renderToJson(el)).toMatchInlineSnapshot(`
      <div>
        count=
        0
      </div>
    `);
  });
});

describe("usePrevious", () => {
  it("basic", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => {
        const prev = usePrevious(value);
        return { value, prev };
      },
      { initialProps: { value: 0 } }
    );
    expect(result.current).toMatchInlineSnapshot(`
      {
        "prev": 0,
        "value": 0,
      }
    `);
    rerender({ value: 1 });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "prev": 0,
        "value": 1,
      }
    `);
    rerender({ value: 2 });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "prev": 1,
        "value": 2,
      }
    `);
    rerender({ value: 2 });
    expect(result.current).toMatchInlineSnapshot(`
      {
        "prev": 2,
        "value": 2,
      }
    `);
  });
});
