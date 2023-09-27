import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { Fragment, type VNode, h, reconcile, render } from "./core-v2";

describe(reconcile, () => {
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
              "type": "text",
            },
            {
              "child": {
                "data": "world",
                "hnode": world,
                "type": "text",
              },
              "hnode": <span
                class="text-red"
              >
                world
              </span>,
              "listeners": Map {},
              "name": "span",
              "props": {
                "class": "text-red",
              },
              "type": "tag",
            },
          ],
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
    bnode = reconcile(vnode, bnode, parent);
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
                "type": "text",
              },
              "hnode": <span>
                hello
              </span>,
              "listeners": Map {},
              "name": "span",
              "props": {},
              "type": "tag",
            },
            {
              "data": "world",
              "hnode": world,
              "type": "text",
            },
          ],
          "slot": world,
          "type": "fragment",
        },
        "parent": <main>
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

  it("fragment children key", () => {
    const keys = [..."abc"];
    const vnode = h(
      Fragment,
      {},
      ...keys.map((key) => h("span", { key, "data-prop": key }))
    );
    const parent = document.createElement("main");

    // initial render
    const bnode = render(vnode, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span
          data-prop="a"
        />
        <span
          data-prop="b"
        />
        <span
          data-prop="c"
        />
      </main>
    `);

    // mutate dom
    parent.childNodes.forEach((node) => {
      tinyassert(node instanceof HTMLElement);
      node.dataset["mutate"] = node.dataset["prop"];
    });
    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span
          data-mutate="a"
          data-prop="a"
        />
        <span
          data-mutate="b"
          data-prop="b"
        />
        <span
          data-mutate="c"
          data-prop="c"
        />
      </main>
    `);

    // update fragment children while keeping key
    tinyassert(vnode.type === "fragment");
    vnode.children.reverse();
    tinyassert(vnode.children[0].type === "tag");
    vnode.children[0].props = {
      "data-prop-x": "boom",
    };

    // re-render should keep mutated dom
    reconcile(vnode, bnode, parent);

    expect(parent).toMatchInlineSnapshot(`
      <main>
        <span
          data-mutate="c"
          data-prop-x="boom"
        />
        <span
          data-mutate="b"
          data-prop="b"
        />
        <span
          data-mutate="a"
          data-prop="a"
        />
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

    let bnode = reconcile(vnode, { type: "empty" }, parent);
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
    bnode = reconcile(vnode, bnode, parent);

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

    let bnode = reconcile(vnode, { type: "empty" }, parent);
    expect(parent).toMatchInlineSnapshot(`
      <main>
        a
        b
        c
      </main>
    `);

    vnode = h(Fragment, {}, "a", h("span", {}, "b"), "c");
    bnode = reconcile(vnode, bnode, parent);

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
    let vnode = h("button", {
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

    vnode = h("button", {});
    bnode = reconcile(vnode, bnode, parent);
    (parent.firstChild as HTMLElement).click();
    expect(mockFn.mock.calls).toMatchInlineSnapshot("[]");
  });
});

describe(h, () => {
  it("basic", () => {
    const parent = document.createElement("main");
    function Custom(props: any) {
      return h("input", { placeholder: props.value });
    }
    const vnode = h(
      "div",
      { class: "flex" },
      h(Custom, { value: "hello" }),
      null,
      h("span", { class: "text-red" }, "world")
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
                "children": [
                  {
                    "data": "world",
                    "type": "text",
                  },
                ],
                "type": "fragment",
              },
              "key": undefined,
              "name": "span",
              "props": {
                "class": "text-red",
              },
              "type": "tag",
            },
          ],
          "type": "fragment",
        },
        "key": undefined,
        "name": "div",
        "props": {
          "class": "flex",
        },
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
