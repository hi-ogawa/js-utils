import { describe, expect, it } from "vitest";
import { type VNode, render } from "./core-v2";

describe(render, () => {
  it("basic", () => {
    const parent = document.createElement("main");
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
});
