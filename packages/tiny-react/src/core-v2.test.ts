import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
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
              "name": "span",
              "props": {
                "class": "text-red",
              },
              "type": "tag",
            },
          ],
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
          "type": "fragment",
        },
        "props": {
          "value": "hello",
        },
        "render": [Function],
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

    // TODO: reconcilation still needs to mutate parent to re-order
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

    // TODO: broken nested fragment re-ordering
    expect(parent).toMatchInlineSnapshot(`
      <main>
        2
        1
        3
        4
      </main>
    `);
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
