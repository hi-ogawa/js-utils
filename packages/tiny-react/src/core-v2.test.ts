import { describe, expect, it } from "vitest";
import { type VNode, h, render } from "./core-v2";

describe(render, () => {
  it("basic", () => {
    const vnode: VNode = {
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
    const bnode = render(vnode, parent);
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
});

describe(h, () => {
  it("basic", () => {
    h("div", {});
    const parent = document.createElement("main");
    function Custom(props: any) {
      return h("input", { placeholder: props.value });
    }
    const vnode = h(
      "div",
      { class: "flex" },
      h(Custom, { value: "hello" }),
      h("span", { class: "text-red" }, "world")
    );
    expect(vnode).toMatchInlineSnapshot(`
      {
        "child": {
          "children": [
            {
              "key": undefined,
              "props": {
                "value": "hello",
              },
              "render": [Function],
              "type": "custom",
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
