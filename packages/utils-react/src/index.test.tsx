import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Compose } from "./compose";
import { Debug } from "./debug";
import { toArraySetState, toDelayedSetState, toSetSetState } from "./set-state";
import { renderToJson } from "./test/helper";
import { usePrevious, useRefCallbackEffect, useStableCallback } from "./utils";

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
    const el = (
      <Compose
        elements={[
          <div className="div-1" />,
          <div className="div-2">
            <span>not-ok</span>
          </div>,
          <div className="div-3" />,
        ]}
      >
        <span>ok</span>
      </Compose>
    );

    expect(renderToJson(el)).toMatchInlineSnapshot(`
      <div
        className="div-1"
      >
        <div
          className="div-2"
        >
          <div
            className="div-3"
          >
            <span>
              ok
            </span>
          </div>
        </div>
      </div>
    `);
  });
});

describe("useStableCallback", () => {
  it("basic", async () => {
    function useDocumentEvent<K extends keyof DocumentEventMap>(
      type: K,
      handler: (e: DocumentEventMap[K]) => void
    ) {
      const stableHandler = useStableCallback(handler);

      React.useEffect(() => {
        document.addEventListener(type, stableHandler);
        return () => {
          document.removeEventListener(type, stableHandler);
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

describe("useRefCallbackEffect", () => {
  it("basic", async () => {
    function TestComponent() {
      const [result, setResult] = React.useState<unknown[]>([]);
      const { push } = toArraySetState(setResult);

      const ref = useRefCallbackEffect<HTMLElement>((el) => {
        push({ begin: el.tagName });
        return () => {
          push({ end: el.tagName });
        };
      });

      const [step, setStep] = React.useState(0);

      return (
        <div>
          <main
            dangerouslySetInnerHTML={{ __html: JSON.stringify(result) }}
          ></main>
          <button onClick={() => setStep((x) => x + 1)}></button>
          {step === 1 && <span ref={ref}></span>}
          {step === 3 && <div ref={ref}></div>}
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByRole("main")).toMatchInlineSnapshot(`
      <main>
        []
      </main>
    `);

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("main")).toMatchInlineSnapshot(`
      <main>
        [{"begin":"SPAN"}]
      </main>
    `);

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("main")).toMatchInlineSnapshot(`
      <main>
        [{"begin":"SPAN"},{"end":"SPAN"}]
      </main>
    `);

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("main")).toMatchInlineSnapshot(`
      <main>
        [{"begin":"SPAN"},{"end":"SPAN"},{"begin":"DIV"}]
      </main>
    `);

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("main")).toMatchInlineSnapshot(`
      <main>
        [{"begin":"SPAN"},{"end":"SPAN"},{"begin":"DIV"},{"end":"DIV"}]
      </main>
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

    act(() => {
      result.current.setArrayState.toggle(4);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      [
        3,
        5,
        0,
      ]
    `);
  });
});

describe("toSetSetState", () => {
  it("basic", async () => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(() => new Set([0]));
      const setArrayState = toSetSetState(setState);
      return { state, setState, setArrayState };
    });

    expect(result.current.state).toMatchInlineSnapshot(`
      Set {
        0,
      }
    `);

    act(() => {
      result.current.setArrayState.add(1);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      Set {
        0,
        1,
      }
    `);

    act(() => {
      result.current.setArrayState.delete(0);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      Set {
        1,
      }
    `);

    act(() => {
      result.current.setArrayState.toggle(3);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      Set {
        1,
        3,
      }
    `);
    act(() => {
      result.current.setArrayState.toggle(1);
    });
    expect(result.current.state).toMatchInlineSnapshot(`
      Set {
        3,
      }
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
