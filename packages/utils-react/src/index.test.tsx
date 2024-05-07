import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Compose } from "./compose";
import { Debug } from "./debug";
import { toArraySetState, toSetSetState } from "./set-state";
import { renderToJson } from "./test/helper";
import { useDebounce, useDelay } from "./timer";
import {
  useMergeRefs,
  usePrevious,
  useRefCallbackEffect,
  useStableCallback,
} from "./utils";

afterEach(cleanup);

describe(Debug, () => {
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

describe(Compose, () => {
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

describe(useStableCallback, () => {
  it("basic", async () => {
    function useDocumentEvent<K extends keyof DocumentEventMap>(
      type: K,
      handler: (e: DocumentEventMap[K]) => void,
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

describe(useRefCallbackEffect, () => {
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

describe(useMergeRefs, () => {
  it("basic", async () => {
    const fn = vi.fn();

    const DemoInner = React.forwardRef(
      (
        props: { label: string },
        forwarded: React.ForwardedRef<HTMLElement>,
      ) => {
        const mut = React.useRef<HTMLElement>();

        const fun = React.useCallback<(el: HTMLElement | null) => void>(
          (el) => fn(props.label, "fun", el),
          [],
        );

        React.useEffect(() => {
          fn(props.label, "mut", mut.current);
          fn(props.label, "forwarded", forwarded);
        }, []);

        const ref = useMergeRefs(mut, fun, forwarded);

        return <main ref={ref}></main>;
      },
    );

    function Demo() {
      const mut = React.useRef<HTMLElement>(null);
      const fun = React.useCallback<(el: HTMLElement | null) => void>(
        (el) => fn("outer-fun", el),
        [],
      );

      React.useEffect(() => {
        fn("outer-mut", mut.current);
      }, []);

      const [show, setShow] = React.useState(true);

      return (
        <div>
          {show && (
            <>
              <DemoInner label="inner-none" />
              <DemoInner label="inner-mut" ref={mut} />
              <DemoInner label="inner-fun" ref={fun} />
            </>
          )}
          <button onClick={() => setShow((v) => !v)}></button>
        </div>
      );
    }

    render(<Demo />);
    expect(fn.mock.calls.map((c) => c.join(":"))).toMatchInlineSnapshot(`
      [
        "inner-none:fun:[object HTMLElement]",
        "inner-mut:fun:[object HTMLElement]",
        "inner-fun:fun:[object HTMLElement]",
        "outer-fun:[object HTMLElement]",
        "inner-none:mut:[object HTMLElement]",
        "inner-none:forwarded:",
        "inner-mut:mut:[object HTMLElement]",
        "inner-mut:forwarded:[object Object]",
        "inner-fun:mut:[object HTMLElement]",
        "inner-fun:forwarded:(el) => fn("outer-fun", el)",
        "outer-mut:[object HTMLElement]",
      ]
    `);
    fn.mockReset();
    await userEvent.click(screen.getByRole("button"));
    expect(fn.mock.calls.map((c) => c.join(":"))).toMatchInlineSnapshot(`
      [
        "inner-none:fun:",
        "inner-mut:fun:",
        "inner-fun:fun:",
        "outer-fun:",
      ]
    `);
    fn.mockReset();
    await userEvent.click(screen.getByRole("button"));
    expect(fn.mock.calls.map((c) => c.join(":"))).toMatchInlineSnapshot(`
      [
        "inner-none:fun:[object HTMLElement]",
        "inner-mut:fun:[object HTMLElement]",
        "inner-fun:fun:[object HTMLElement]",
        "outer-fun:[object HTMLElement]",
        "inner-none:mut:[object HTMLElement]",
        "inner-none:forwarded:",
        "inner-mut:mut:[object HTMLElement]",
        "inner-mut:forwarded:[object Object]",
        "inner-fun:mut:[object HTMLElement]",
        "inner-fun:forwarded:(el) => fn("outer-fun", el)",
      ]
    `);
  });
});

describe(usePrevious, () => {
  it("basic", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => {
        const prev = usePrevious(value);
        return { value, prev };
      },
      { initialProps: { value: 0 } },
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

describe(toArraySetState, () => {
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

describe(toSetSetState, () => {
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

describe(useDelay, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("basic", async () => {
    const { result } = renderHook(() => {
      const [state, setState] = React.useState(false);
      const setStateDelayed = useDelay(setState, 100);
      return { state, setState, setStateDelayed };
    });

    expect(result.current.state).toMatchInlineSnapshot("false");

    act(() => {
      result.current.setState(true);
    });
    expect(result.current.state).toMatchInlineSnapshot("true");

    act(() => {
      result.current.setStateDelayed(false);
    });
    expect(result.current.state).toMatchInlineSnapshot("true");

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current.state).toMatchInlineSnapshot("true");

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current.state).toMatchInlineSnapshot("false");
  });
});

// TODO: test effect cleanup
describe(useDebounce, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("basic", async () => {
    const { result, unmount } = renderHook(() => {
      const [state, setState] = React.useState<number[]>([]);
      const { push } = toArraySetState(setState);
      const [debounced, { isPending }] = useDebounce(push, 100);
      return { result: { state, isPending }, push, debounced };
    });

    expect(result.current.result).toMatchInlineSnapshot(`
      {
        "isPending": false,
        "state": [],
      }
    `);

    act(() => {
      result.current.push(0);
    });
    expect(result.current.result).toMatchInlineSnapshot(`
      {
        "isPending": false,
        "state": [
          0,
        ],
      }
    `);

    act(() => {
      result.current.debounced(1);
    });
    expect(result.current.result).toMatchInlineSnapshot(`
      {
        "isPending": true,
        "state": [
          0,
        ],
      }
    `);

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current.result).toMatchInlineSnapshot(`
      {
        "isPending": true,
        "state": [
          0,
        ],
      }
    `);

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current.result).toMatchInlineSnapshot(`
      {
        "isPending": false,
        "state": [
          0,
          1,
        ],
      }
    `);

    act(() => {
      result.current.debounced(2);
      unmount();
      vi.runAllTimers();
    });
    expect(result.current.result).toMatchInlineSnapshot(`
      {
        "isPending": false,
        "state": [
          0,
          1,
        ],
      }
    `);
  });
});
