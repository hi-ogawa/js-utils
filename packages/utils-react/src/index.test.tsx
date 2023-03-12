import { act, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Compose } from "./compose";
import { Debug } from "./debug";
import { usePrevious, useStableRef } from "./misc";
import { toArraySetState, toDelayedSetState } from "./set-state";
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
  it("basic", async () => {
    function useDocumentEvent<K extends keyof DocumentEventMap>(
      type: K,
      handler: (e: DocumentEventMap[K]) => void
    ) {
      const handlerRef = useStableRef(handler);

      React.useEffect(() => {
        const wrapper = (e: DocumentEventMap[K]) => {
          handlerRef.current(e);
        };
        document.addEventListener(type, wrapper);
        return () => {
          document.removeEventListener(type, wrapper);
        };
      });
    }

    const { result } = renderHook(() => {
      const [enabled, setEnabled] = React.useState(false);

      useDocumentEvent("keyup", (e) => {
        if (e.key === " ") {
          setEnabled(!enabled);
        }
      });

      return { enabled };
    });

    expect(result.current).toMatchInlineSnapshot(`
      {
        "enabled": false,
      }
    `);
    await userEvent.keyboard(" ");
    expect(result.current).toMatchInlineSnapshot(`
      {
        "enabled": true,
      }
    `);
    await userEvent.keyboard(" ");
    expect(result.current).toMatchInlineSnapshot(`
      {
        "enabled": false,
      }
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

describe("toArraySetState", () => {
  it("basic", async () => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(() => [0]);
      const setArrayState = toArraySetState(setState);
      return { state, setState, setArrayState };
    });

    expect(result.current.state).toMatchInlineSnapshot(`
      [
        0,
      ]
    `);

    act(() => {
      result.current.setArrayState.push(1);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      [
        0,
        1,
      ]
    `);

    act(() => {
      result.current.setArrayState.push(2, 3);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
        3,
      ]
    `);

    act(() => {
      result.current.setArrayState.sort((x, y) => y - x);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      [
        3,
        2,
        1,
        0,
      ]
    `);

    act(() => {
      result.current.setArrayState.splice(1, 2, /* ...items */ 4, 5);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      [
        3,
        4,
        5,
        0,
      ]
    `);
  });
});

describe("toDelayedSetState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("basic", async () => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(false);
      const [setStateDelayed, reset, pending] = toDelayedSetState(setState);
      return { state, setState, setStateDelayed, reset, pending };
    });

    expect(result.current.state).toMatchInlineSnapshot("false");
    expect(result.current.pending).toMatchInlineSnapshot("false");

    act(() => {
      result.current.setState(true);
    });
    expect(result.current.state).toMatchInlineSnapshot("true");
    expect(result.current.pending).toMatchInlineSnapshot("false");

    act(() => {
      result.current.setStateDelayed(false, 100);
    });
    expect(result.current.state).toMatchInlineSnapshot("true");
    expect(result.current.pending).toMatchInlineSnapshot("true");

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current.state).toMatchInlineSnapshot("true");
    expect(result.current.pending).toMatchInlineSnapshot("true");

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current.state).toMatchInlineSnapshot("false");
    expect(result.current.pending).toMatchInlineSnapshot("false");
  });
});
