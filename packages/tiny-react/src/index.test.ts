import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { Fragment, h } from "./helper/hyperscript";
import { useCallback, useEffect, useMemo, useRef, useState } from "./hooks";
import { render, rerenderCustomNode } from "./reconciler";
import type { VNode } from "./virtual-dom";

describe(render, () => {
  it("basic", () => {
    let vnode: VNode = {
      type: "tag",
      name: "div",
      props: { class: "flex items-center gap-2" },
      child: {
        type: "fragment",
        children: [
          {
            type: "text",
            data: "hello",
          },
          {
            type: "tag",
            name: "span",
            props: { class: "text-red" },
            child: {
              type: "text",
              data: "world",
            },
          },
        ],
      },
    };
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
              "data": "hello",
              "hnode": hello,
              "parent": [Circular],
              "type": "text",
            },
            {
              "child": {
                "data": "world",
                "hnode": world,
                "parent": [Circular],
                "type": "text",
              },
              "hnode": <span
                class="text-red"
              >
                world
              </span>,
              "listeners": Map {},
              "name": "span",
              "parent": [Circular],
              "props": {
                "class": "text-red",
              },
              "type": "tag",
            },
          ],
          "parent": [Circular],
          "slot": <span
            class="text-red"
          >
            world
          </span>,
          "type": "fragment",
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
        "name": "div",
        "props": {
          "class": "flex items-center gap-2",
        },
        "type": "tag",
      }
    `);
    vnode = {
      ...vnode,
      child: {
        type: "text",
        data: "reconcile",
      },
    };
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
          "data": "reconcile",
          "hnode": reconcile,
          "parent": [Circular],
          "type": "text",
        },
        "hnode": <div
          class="flex items-center gap-2"
        >
          reconcile
        </div>,
        "listeners": Map {},
        "name": "div",
        "props": {
          "class": "flex items-center gap-2",
        },
        "type": "tag",
      }
    `);
  });

  it("custom", () => {
    const vnode: VNode = {
      type: "custom",
      props: { value: "hello" },
      render: (props) => ({
        type: "fragment",
        children: [
          {
            type: "tag",
            name: "span",
            props: {},
            child: {
              type: "text",
              data: (props as any).value,
            },
          },
          {
            type: "text",
            data: "world",
          },
        ],
      }),
    };
    const parent = document.createElement("main");
    const bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span>
          hello
        </span>
        world
      </main>
    `);
    expect(bnode).toMatchInlineSnapshot(`
      {
        "child": {
          "children": [
            {
              "child": {
                "data": "hello",
                "hnode": hello,
                "parent": [Circular],
                "type": "text",
              },
              "hnode": <span>
                hello
              </span>,
              "listeners": Map {},
              "name": "span",
              "parent": [Circular],
              "props": {},
              "type": "tag",
            },
            {
              "data": "world",
              "hnode": world,
              "parent": [Circular],
              "type": "text",
            },
          ],
          "parent": [Circular],
          "slot": world,
          "type": "fragment",
        },
        "hookContext": HookContext {
          "hookCount": 0,
          "hooks": [],
          "initial": false,
          "notify": [Function],
          "useCallback": [Function],
          "useEffect": [Function],
          "useMemo": [Function],
          "useReducer": [Function],
          "useRef": [Function],
          "useState": [Function],
        },
        "hparent": <main>
          <span>
            hello
          </span>
          world
        </main>,
        "props": {
          "value": "hello",
        },
        "render": [Function],
        "slot": world,
        "type": "custom",
      }
    `);
  });

  it("fragment children key basic", () => {
    const vnode: VNode = {
      type: "fragment",
      children: [..."abc"].map((key) => h.span({ key }, key)),
    };
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

    // update fragment children while keeping key
    tinyassert(vnode.type === "fragment");
    vnode.children.reverse();
    tinyassert(vnode.children[0].type === "tag");
    vnode.children[0].props = {
      "data-new-prop": "boom",
    };

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
    let vnode: VNode = {
      type: "fragment",
      children: [],
    };
    const parent = document.createElement("main");

    const hchild = (key: string) => h.div({ key }, key);

    let bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot("<main />");

    vnode = {
      type: "fragment",
      children: [hchild("a")],
    };
    bnode = render(vnode, parent, bnode);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div>
          a
        </div>
      </main>
    `);

    vnode = {
      type: "fragment",
      children: [hchild("a"), hchild("b")],
    };
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
});

describe(rerenderCustomNode, () => {
  it("basic", () => {
    let vnode = {
      type: "fragment",
      children: [
        {
          type: "custom",
          props: {
            tag: "div",
          },
          render: (props: any) => h(props.tag, {}, "x"),
        },
        {
          type: "custom",
          props: {
            tag: "span",
          },
          render: (props: any) => h(props.tag, {}, "y"),
        },
      ],
    } satisfies VNode;
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
    tinyassert(bnode.type === "fragment");
    expect(bnode.slot).toMatchInlineSnapshot(`
      <span>
        y
      </span>
    `);

    tinyassert(bnode.children[0].type === "custom");
    rerenderCustomNode(
      {
        ...vnode.children[0],
        props: {
          tag: "p",
        },
      },
      bnode.children[0]
    );
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
    expect(bnode.slot).toMatchInlineSnapshot(`
      <span>
        y
      </span>
    `);

    tinyassert(bnode.children[1].type === "custom");
    rerenderCustomNode(
      {
        ...vnode.children[1],
        props: {
          tag: "b",
        },
      },
      bnode.children[1]
    );
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
    expect(bnode.slot).toMatchInlineSnapshot(`
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
      "\"Cannot access 'vcustom' before initialization\""
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
      return h(
        Fragment,
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
        <span>
          x
        </span>
        <span>
          y
        </span>
        <button />
      </main>
    `);

    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span>
          xx
        </span>
      </main>
    `);
  });

  it("multiple update - nested component - unmount - 2", () => {
    function Custom() {
      const [state, setState] = useState("x");
      return h(
        Fragment,
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
      return h(
        Fragment,
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
        <span>
          x
        </span>
        <span>
          y
        </span>
        <button />
      </main>
    `);

    // TODO: unmounted Custom2's setState is breaking parent
    parent.querySelector("button")!.click();
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span />
        <button />
        <span>
          xx
        </span>
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
          {"state":2,"state2":4,"prop":"x"}
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

  it("useEffect", () => {
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

describe("hyperscript", () => {
  it("basic", () => {
    const parent = document.createElement("main");
    function Custom(props: { value: string }) {
      return h.input({ placeholder: props.value });
    }
    const vnode = h.div(
      { className: "flex" },
      h(Custom, { value: "hello" }),
      null,
      h.span({ className: "text-red" }, "world")
    );
    expect(vnode).toMatchInlineSnapshot(`
      {
        "child": {
          "children": [
            {
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
            {
              "type": "empty",
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
          "className": "flex",
        },
        "ref": undefined,
        "type": "tag",
      }
    `);
    render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <div
          class="flex"
        >
          <input
            placeholder="hello"
          />
          <span
            class="text-red"
          >
            world
          </span>
        </div>
      </main>
    `);
  });
});
