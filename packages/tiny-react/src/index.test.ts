import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { createRoot, memo } from "./compat";
import { Fragment, createElement, h } from "./helper/hyperscript";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "./hooks";
import { render, updateCustomNode } from "./reconciler";
import { sleepFrame } from "./test-utils";
import { getBNodeSlot } from "./virtual-dom";

describe(render, () => {
  it("basic", () => {
    let vnode = h.div(
      { className: "flex items-center gap-2" },
      "hello",
      h.span({ className: "text-red" }, "world")
    );
    const parent = document.createElement("main");
    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div
          class="flex items-center gap-2"
        >
          hello
          <span
            class="text-red"
          >
            world
          </span>
        </div>
      </main>
    `);
    expect(bnode).toMatchInlineSnapshot(`
      {
        "child": {
          "children": [
            {
              "hnode": hello,
              "type": "text",
              "vnode": {
                "data": "hello",
                "type": "text",
              },
            },
            {
              "child": {
                "hnode": world,
                "type": "text",
                "vnode": {
                  "data": "world",
                  "type": "text",
                },
              },
              "hnode": <span
                class="text-red"
              >
                world
              </span>,
              "listeners": Map {},
              "type": "tag",
              "vnode": {
                "child": {
                  "data": "world",
                  "type": "text",
                },
                "key": undefined,
                "name": "span",
                "props": {
                  "className": "text-red",
                },
                "ref": undefined,
                "type": "tag",
              },
            },
          ],
          "parent": [Circular],
          "slot": <span
            class="text-red"
          >
            world
          </span>,
          "type": "fragment",
          "vnode": {
            "children": [
              {
                "data": "hello",
                "type": "text",
              },
              {
                "child": {
                  "data": "world",
                  "type": "text",
                },
                "key": undefined,
                "name": "span",
                "props": {
                  "className": "text-red",
                },
                "ref": undefined,
                "type": "tag",
              },
            ],
            "type": "fragment",
          },
        },
        "hnode": <div
          class="flex items-center gap-2"
        >
          hello
          <span
            class="text-red"
          >
            world
          </span>
        </div>,
        "listeners": Map {},
        "type": "tag",
        "vnode": {
          "child": {
            "children": [
              {
                "data": "hello",
                "type": "text",
              },
              {
                "child": {
                  "data": "world",
                  "type": "text",
                },
                "key": undefined,
                "name": "span",
                "props": {
                  "className": "text-red",
                },
                "ref": undefined,
                "type": "tag",
              },
            ],
            "type": "fragment",
          },
          "key": undefined,
          "name": "div",
          "props": {
            "className": "flex items-center gap-2",
          },
          "ref": undefined,
          "type": "tag",
        },
      }
    `);
    vnode = h.div({ className: "flex items-center gap-2" }, "reconcile");
    bnode = render(vnode, parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div
          class="flex items-center gap-2"
        >
          reconcile
        </div>
      </main>
    `);
    expect(bnode).toMatchInlineSnapshot(`
      {
        "child": {
          "hnode": reconcile,
          "type": "text",
          "vnode": {
            "data": "reconcile",
            "type": "text",
          },
        },
        "hnode": <div
          class="flex items-center gap-2"
        >
          reconcile
        </div>,
        "listeners": Map {},
        "type": "tag",
        "vnode": {
          "child": {
            "data": "reconcile",
            "type": "text",
          },
          "key": undefined,
          "name": "div",
          "props": {
            "className": "flex items-center gap-2",
          },
          "ref": undefined,
          "type": "tag",
        },
      }
    `);
  });

  it("custom", () => {
    function Custom(props: { value: string }) {
      return h.div({}, h.span({}, props.value), "world");
    }

    const vnode = h(Custom, { value: "hello" });
    const parent = document.createElement("main");
    const bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            hello
          </span>
          world
        </div>
      </main>
    `);
    expect(bnode).toMatchInlineSnapshot(`
      {
        "child": {
          "child": {
            "children": [
              {
                "child": {
                  "hnode": hello,
                  "type": "text",
                  "vnode": {
                    "data": "hello",
                    "type": "text",
                  },
                },
                "hnode": <span>
                  hello
                </span>,
                "listeners": Map {},
                "type": "tag",
                "vnode": {
                  "child": {
                    "data": "hello",
                    "type": "text",
                  },
                  "key": undefined,
                  "name": "span",
                  "props": {},
                  "ref": undefined,
                  "type": "tag",
                },
              },
              {
                "hnode": world,
                "type": "text",
                "vnode": {
                  "data": "world",
                  "type": "text",
                },
              },
            ],
            "parent": [Circular],
            "slot": world,
            "type": "fragment",
            "vnode": {
              "children": [
                {
                  "child": {
                    "data": "hello",
                    "type": "text",
                  },
                  "key": undefined,
                  "name": "span",
                  "props": {},
                  "ref": undefined,
                  "type": "tag",
                },
                {
                  "data": "world",
                  "type": "text",
                },
              ],
              "type": "fragment",
            },
          },
          "hnode": <div>
            <span>
              hello
            </span>
            world
          </div>,
          "listeners": Map {},
          "type": "tag",
          "vnode": {
            "child": {
              "children": [
                {
                  "child": {
                    "data": "hello",
                    "type": "text",
                  },
                  "key": undefined,
                  "name": "span",
                  "props": {},
                  "ref": undefined,
                  "type": "tag",
                },
                {
                  "data": "world",
                  "type": "text",
                },
              ],
              "type": "fragment",
            },
            "key": undefined,
            "name": "div",
            "props": {},
            "ref": undefined,
            "type": "tag",
          },
        },
        "hookContext": HookContext {
          "hookCount": 0,
          "hooks": [],
          "initial": false,
          "notify": [Function],
          "useEffect": [Function],
          "useReducer": [Function],
        },
        "hparent": <main>
          <div>
            <span>
              hello
            </span>
            world
          </div>
        </main>,
        "parent": undefined,
        "slot": <div>
          <span>
            hello
          </span>
          world
        </div>,
        "type": "custom",
        "vnode": {
          "key": undefined,
          "props": {
            "children": {
              "type": "empty",
            },
            "value": "hello",
          },
          "render": [Function],
          "type": "custom",
        },
      }
    `);
  });

  it("fragment children key basic", () => {
    let vnode = h(Fragment, {}, [
      h.span({ key: "a" }, "a"),
      h.span({ key: "b" }, "b"),
      h.span({ key: "c" }, "c"),
    ]);
    const parent = document.createElement("main");

    // initial render
    const bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span>
          a
        </span>
        <span>
          b
        </span>
        <span>
          c
        </span>
      </main>
    `);

    // mutate dom
    parent.childNodes.forEach((node) => {
      tinyassert(node instanceof HTMLElement);
      node.setAttribute("data-mutate", node.textContent ?? "");
    });
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span
          data-mutate="a"
        >
          a
        </span>
        <span
          data-mutate="b"
        >
          b
        </span>
        <span
          data-mutate="c"
        >
          c
        </span>
      </main>
    `);

    // update children while keeping key
    vnode = h(Fragment, {}, [
      h.span({ key: "c", ["data-new-prop" as any]: "boom" }, "c"),
      h.span({ key: "b" }, "b"),
      h.span({ key: "a" }, "a"),
    ]);

    // re-render should keep mutated dom
    render(vnode, parent, bnode);

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span
          data-mutate="c"
          data-new-prop="boom"
        >
          c
        </span>
        <span
          data-mutate="b"
        >
          b
        </span>
        <span
          data-mutate="a"
        >
          a
        </span>
      </main>
    `);
  });

  it("fragment children key - append", () => {
    let vnode = h(Fragment, {});
    const parent = document.createElement("main");

    const hchild = (key: string) => h.div({ key }, key);

    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot("<main />");

    vnode = h(Fragment, {}, [hchild("a")]);
    bnode = render(vnode, parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          a
        </div>
      </main>
    `);

    vnode = h(Fragment, {}, [hchild("a"), hchild("b")]);
    bnode = render(vnode, parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          a
        </div>
        <div>
          b
        </div>
      </main>
    `);
  });

  it("fragment children key - prepend", () => {
    const parent = document.createElement("main");
    const hc = (key: string) => h.div({ key }, key);

    let bnode = render(h(Fragment, {}, []), parent);
    expect(parent).toMatchInlineSnapshot("<main />");

    bnode = render(h(Fragment, {}, [hc("a")]), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          a
        </div>
      </main>
    `);

    // prepend new child
    bnode = render(h(Fragment, {}, [hc("b"), hc("a")]), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          b
        </div>
        <div>
          a
        </div>
      </main>
    `);

    // mix
    bnode = render(h(Fragment, {}, [hc("c"), hc("a"), hc("b")]), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          c
        </div>
        <div>
          a
        </div>
        <div>
          b
        </div>
      </main>
    `);

    // delete
    bnode = render(h(Fragment, {}, [hc("c"), hc("b")]), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          c
        </div>
        <div>
          b
        </div>
      </main>
    `);
  });

  it("nested fragment", () => {
    let vnode = h(
      Fragment,
      {},
      h(Fragment, { key: "x" }, "1", "2"),
      h(Fragment, { key: "y" }, "3", "4")
    );
    const parent = document.createElement("main");

    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        1
        2
        3
        4
      </main>
    `);

    vnode = h(
      Fragment,
      {},
      h(Fragment, { key: "y" }, "3", "4"),
      h(Fragment, { key: "x" }, "1", "2")
    );
    bnode = render(vnode, parent, bnode);

    expect(parent).toMatchInlineSnapshot(`
      <main>
        3
        4
        1
        2
      </main>
    `);
  });

  it("subtree", () => {
    let vnode = h(Fragment, {}, "a", "b", "c");
    const parent = document.createElement("main");

    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        a
        b
        c
      </main>
    `);

    vnode = h(Fragment, {}, "a", h.span({}, "b"), "c");
    bnode = render(vnode, parent, bnode);

    expect(parent).toMatchInlineSnapshot(`
      <main>
        a
        <span>
          b
        </span>
        c
      </main>
    `);
  });

  it("event-listener", () => {
    const mockFn = vi.fn();
    let vnode = h.button({
      onclick: () => {
        mockFn("click");
      },
    });
    const parent = document.createElement("main");
    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button />
      </main>
    `);
    (parent.firstChild as HTMLElement).click();
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "click",
        ],
      ]
    `);
    mockFn.mockReset();

    vnode = h.button({});
    bnode = render(vnode, parent, bnode);
    (parent.firstChild as HTMLElement).click();
    expect(mockFn.mock.calls).toMatchInlineSnapshot("[]");
  });

  it("forceUpdate keeps latest props", () => {
    function Outer() {
      const [state, setState] = useState(0);

      return h(
        Fragment,
        {},
        h.button({
          id: "outer",
          onclick: () => {
            setState((prev) => prev + 1);
          },
        }),
        JSON.stringify({ outer: state }),
        h(Inner, { value: state })
      );
    }

    function Inner(props: { value: number }) {
      const [state, setState] = useState(0);

      return h(
        Fragment,
        {},
        h.button({
          id: "inner",
          onclick: () => {
            setState((prev) => prev + 1);
          },
        }),
        JSON.stringify({ inner: state, prop: props.value })
      );
    }

    let vnode = h(Outer, {});
    const parent = document.createElement("main");
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button
          id="outer"
        />
        {"outer":0}
        <button
          id="inner"
        />
        {"inner":0,"prop":0}
      </main>
    `);

    (parent.querySelector("#outer") as HTMLElement).click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button
          id="outer"
        />
        {"outer":1}
        <button
          id="inner"
        />
        {"inner":0,"prop":1}
      </main>
    `);

    (parent.querySelector("#inner") as HTMLElement).click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button
          id="outer"
        />
        {"outer":1}
        <button
          id="inner"
        />
        {"inner":1,"prop":1}
      </main>
    `);

    (parent.querySelector("#outer") as HTMLElement).click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button
          id="outer"
        />
        {"outer":2}
        <button
          id="inner"
        />
        {"inner":1,"prop":2}
      </main>
    `);

    (parent.querySelector("#inner") as HTMLElement).click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <button
          id="outer"
        />
        {"outer":2}
        <button
          id="inner"
        />
        {"inner":2,"prop":2}
      </main>
    `);
  });
});

describe(updateCustomNode, () => {
  it("basic", () => {
    // check inner component re-rendering to fixup parent BNode.slot

    let update1!: (tag: string) => void;
    let update2!: (tag: string) => void;

    function Custom1() {
      const [tag, setTag] = useState("div");
      update1 = setTag;
      return createElement(tag, {}, "x");
    }

    function Custom2() {
      const [tag, setTag] = useState("span");
      update2 = setTag;
      return createElement(tag, {}, "y");
    }

    let vnode = h(Fragment, {}, h(Custom1, {}), h(Custom2, {}));
    const parent = document.createElement("main");

    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          x
        </div>
        <span>
          y
        </span>
      </main>
    `);
    expect(getBNodeSlot(bnode)).toMatchInlineSnapshot(`
      <span>
        y
      </span>
    `);

    update1("p");
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <p>
          x
        </p>
        <span>
          y
        </span>
      </main>
    `);
    expect(getBNodeSlot(bnode)).toMatchInlineSnapshot(`
      <span>
        y
      </span>
    `);

    update2("b");
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <p>
          x
        </p>
        <b>
          y
        </b>
      </main>
    `);
    expect(getBNodeSlot(bnode)).toMatchInlineSnapshot(`
      <b>
        y
      </b>
    `);
  });
});

describe("hooks", () => {
  it("useState", () => {
    function Custom() {
      const [state, setState] = useState(0);
      return h.div(
        {},
        h[state % 2 === 0 ? "span" : "div"]({}, state),
        h.button({
          onclick: () => {
            setState((prev) => prev + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            0
          </span>
          <button />
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
          <button />
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            2
          </span>
          <button />
        </div>
      </main>
    `);
  });

  it("no support for dispatch during render", () => {
    function Custom() {
      const [state, setState] = useState(0);
      setState(1);
      return h.div(
        {},
        h[state % 2 === 0 ? "span" : "div"]({}, state),
        h.button({
          onclick: () => {
            setState((prev) => prev + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    expect(() =>
      render(h(Custom, {}), parent)
    ).toThrowErrorMatchingInlineSnapshot(
      '"Unsupported force-update during render"'
    );
  });

  it("multiple update - same hook", () => {
    function Custom() {
      const [state, setState] = useState(0);
      return h.div(
        {},
        h.span({}, state),
        h.button({
          onclick: () => {
            setState((prev) => prev + 1);
            setState((prev) => prev + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            0
          </span>
          <button />
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            2
          </span>
          <button />
        </div>
      </main>
    `);
  });

  it("multiple update - differnt hook", () => {
    function Custom() {
      const [state, setState] = useState("x");
      const [state2, setState2] = useState("y");
      return h.div(
        {},
        h.span({}, state),
        h.span({}, state2),
        h.button({
          onclick: () => {
            setState((prev) => prev.repeat(2));
            setState2((prev) => prev.repeat(2));
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            x
          </span>
          <span>
            y
          </span>
          <button />
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            xx
          </span>
          <span>
            yy
          </span>
          <button />
        </div>
      </main>
    `);
  });

  it("multiple update - nested component - simple", () => {
    function Custom() {
      const [state, setState] = useState("x");
      return h.div(
        {},
        h.span({}, state),
        h(Custom2, {
          onClick: () => {
            setState((prev) => prev.repeat(2));
          },
        })
      );
    }

    function Custom2(props: { onClick: () => void }) {
      const [state2, setState2] = useState("y");
      return h(
        Fragment,
        {},
        h.span({}, state2),
        h.button({
          onclick: () => {
            setState2((prev) => prev.repeat(2));
            props.onClick();
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            x
          </span>
          <span>
            y
          </span>
          <button />
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            xx
          </span>
          <span>
            yy
          </span>
          <button />
        </div>
      </main>
    `);
  });

  it("multiple update - nested component - unmount - 1", () => {
    function Custom() {
      const [state, setState] = useState("x");
      return h.div(
        {},
        h.span({}, state),
        state.length === 1 &&
          h(Custom2, {
            onClick: () => {
              setState((prev) => prev.repeat(2));
            },
          })
      );
    }

    function Custom2(props: { onClick: () => void }) {
      const [state2, setState2] = useState("y");
      return h.div(
        {},
        h.span({}, state2),
        h.button({
          onclick: () => {
            setState2((prev) => prev.repeat(2));
            props.onClick();
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            x
          </span>
          <div>
            <span>
              y
            </span>
            <button />
          </div>
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            xx
          </span>
        </div>
      </main>
    `);
  });

  it("multiple update - nested component - unmount - 2", () => {
    function Custom() {
      const [state, setState] = useState("x");
      return h.div(
        {},
        h.span({}, state),
        state.length === 1 &&
          h(Custom2, {
            onClick: () => {
              setState((prev) => prev.repeat(2));
            },
          })
      );
    }

    function Custom2(props: { onClick: () => void }) {
      const [state2, setState2] = useState("y");
      return h.div(
        {},
        h.span({}, state2),
        h.button({
          onclick: () => {
            props.onClick();
            setState2((prev) => prev.repeat(2));
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            x
          </span>
          <div>
            <span>
              y
            </span>
            <button />
          </div>
        </div>
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            xx
          </span>
        </div>
      </main>
    `);
  });

  it("useRef", () => {
    function Custom() {
      const ref = useRef(0);
      ref.current++;

      return h.div(
        {},
        h[ref.current % 2 === 0 ? "span" : "div"]({}, ref.current)
      );
    }

    let vnode = h(Custom, {});
    const parent = document.createElement("main");
    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
        </div>
      </main>
    `);

    render(vnode, parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            2
          </span>
        </div>
      </main>
    `);
  });

  it("useMemo", () => {
    const mockFn = vi.fn();

    function Custom({ prop }: any) {
      const [state, setState] = useState(1);

      const state2 = useMemo(() => {
        mockFn("memo", state);
        return state * 2;
      }, [state]);

      return h.div(
        {},
        JSON.stringify({ state, state2, prop }),
        h.button({
          onclick: () => {
            setState(state + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    let bnode = render(h(Custom, { prop: "x" }), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          {"state":1,"state2":2,"prop":"x"}
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "memo",
          1,
        ],
      ]
    `);

    bnode = render(h(Custom, { prop: "y" }), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          {"state":1,"state2":2,"prop":"y"}
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "memo",
          1,
        ],
      ]
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          {"state":2,"state2":4,"prop":"y"}
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "memo",
          1,
        ],
        [
          "memo",
          2,
        ],
      ]
    `);
  });

  it("useLayoutEffect", () => {
    const mockFn = vi.fn();

    function Custom(props: { value: number }) {
      const [state, setState] = useState(0);

      useLayoutEffect(() => {
        mockFn("effect", props.value);
        return () => {
          mockFn("cleanup", props.value);
        };
      }, [props.value]);

      return h.div(
        {},
        h.div({}, state),
        h.button({
          onclick: () => {
            setState(state + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    let bnode = render(h(Custom, { value: 0 }), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            0
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
      ]
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
      ]
    `);

    render(h(Custom, { value: 1 }), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
        [
          "cleanup",
          0,
        ],
        [
          "effect",
          1,
        ],
      ]
    `);

    render(h.div({}), parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div />
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
        [
          "cleanup",
          0,
        ],
        [
          "effect",
          1,
        ],
        [
          "cleanup",
          1,
        ],
      ]
    `);
  });

  it("useEffect", async () => {
    const mockFn = vi.fn();

    function Custom(props: { value: number }) {
      const [state, setState] = useState(0);

      useEffect(() => {
        mockFn("effect", props.value);
        return () => {
          mockFn("cleanup", props.value);
        };
      }, [props.value]);

      return h.div(
        {},
        h.div({}, state),
        h.button({
          onclick: () => {
            setState(state + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    let bnode = render(h(Custom, { value: 0 }), parent);
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            0
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
      ]
    `);

    parent.querySelector("button")!.click();
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
      ]
    `);

    render(h(Custom, { value: 1 }), parent, bnode);
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
        [
          "cleanup",
          0,
        ],
        [
          "effect",
          1,
        ],
      ]
    `);

    render(h.div({}), parent, bnode);
    await sleepFrame();

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div />
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "effect",
          0,
        ],
        [
          "cleanup",
          0,
        ],
        [
          "effect",
          1,
        ],
        [
          "cleanup",
          1,
        ],
      ]
    `);
  });
});

describe("ref", () => {
  it("basic", () => {
    const mockFn = vi.fn();

    function Custom() {
      const [state, setState] = useState(0);

      return h.div(
        {},
        h[state < 2 ? "div" : "span"](
          {
            ref: useCallback((el: Element | null) => {
              mockFn(el?.tagName ?? null);
            }, []),
          },
          state
        ),
        h.button({
          onclick: () => {
            setState(state + 1);
          },
        })
      );
    }

    const parent = document.createElement("main");
    render(h(Custom, {}), parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            0
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "DIV",
        ],
      ]
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <div>
            1
          </div>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "DIV",
        ],
      ]
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          <span>
            2
          </span>
          <button />
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "DIV",
        ],
        [
          null,
        ],
        [
          "SPAN",
        ],
      ]
    `);
  });
});

describe(memo, () => {
  it("basic", async () => {
    const mockFn = vi.fn();

    const Custom = memo(function Custom(props: {
      label: string;
      value: number;
    }) {
      mockFn(`[render] ${props.label} ${props.value}`);

      useEffect(() => {
        mockFn(`[effect] ${props.label} ${props.value}`);
        return () => {
          mockFn(`[dispose] ${props.label} ${props.value}`);
        };
      }, []);

      return h.div({}, props.label, props.value);
    });

    const parent = document.createElement("main");
    const root = createRoot(parent);
    root.render(
      h(
        Fragment,
        {},
        h(Custom, { label: "x-hi", value: 0 }),
        h(Custom, { label: "y-hi", value: 0 })
      )
    );
    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          x-hi
          0
        </div>
        <div>
          y-hi
          0
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[render] x-hi 0",
        ],
        [
          "[render] y-hi 0",
        ],
        [
          "[effect] x-hi 0",
        ],
        [
          "[effect] y-hi 0",
        ],
      ]
    `);

    root.render(
      h(
        Fragment,
        {},
        h(Custom, { label: "x-hi", value: 0 }),
        h(Custom, { label: "y-hi", value: 0 })
      )
    );
    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          x-hi
          0
        </div>
        <div>
          y-hi
          0
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[render] x-hi 0",
        ],
        [
          "[render] y-hi 0",
        ],
        [
          "[effect] x-hi 0",
        ],
        [
          "[effect] y-hi 0",
        ],
      ]
    `);

    root.render(
      h(
        Fragment,
        {},
        h(Custom, { label: "x-hello", value: 0 }),
        h(Custom, { label: "y-hi", value: 0 })
      )
    );
    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          x-hello
          0
        </div>
        <div>
          y-hi
          0
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[render] x-hi 0",
        ],
        [
          "[render] y-hi 0",
        ],
        [
          "[effect] x-hi 0",
        ],
        [
          "[effect] y-hi 0",
        ],
        [
          "[render] x-hello 0",
        ],
      ]
    `);

    root.render(
      h(
        Fragment,
        {},
        h(Custom, { label: "x-hi", value: 0 }),
        h(Custom, { label: "y-hi", value: 0 })
      )
    );
    await sleepFrame();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          x-hi
          0
        </div>
        <div>
          y-hi
          0
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[render] x-hi 0",
        ],
        [
          "[render] y-hi 0",
        ],
        [
          "[effect] x-hi 0",
        ],
        [
          "[effect] y-hi 0",
        ],
        [
          "[render] x-hello 0",
        ],
        [
          "[render] x-hi 0",
        ],
      ]
    `);

    root.render(
      h(
        Fragment,
        {},
        h(Custom, { label: "x-hi", value: 1 }),
        h(Custom, { label: "y-hi", value: 0 })
      )
    );
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          x-hi
          1
        </div>
        <div>
          y-hi
          0
        </div>
      </main>
    `);
    expect(mockFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[render] x-hi 0",
        ],
        [
          "[render] y-hi 0",
        ],
        [
          "[effect] x-hi 0",
        ],
        [
          "[effect] y-hi 0",
        ],
        [
          "[render] x-hello 0",
        ],
        [
          "[render] x-hi 0",
        ],
        [
          "[render] x-hi 1",
        ],
      ]
    `);
  });
});
