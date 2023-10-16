import { describe, expect, it } from "vitest";
import { Fragment, h } from "./hyperscript";

describe("hyperscript", () => {
  it("basic", () => {
    function Custom(props: { value: string }) {
      return h.input({ placeholder: props.value });
    }
    const vnode = h.div(
      { className: "flex" },
      h(Custom, { value: "hello", key: "abc" }),
      null,
      0,
      // current Fragment is encoded via "custom" but it could be directly mapped to "fragment"
      h(Fragment, {}),
      undefined,
      h.span({ className: "text-red", key: 0, ref: () => {} }, "world"),
      // no "fragment" wrapping if single child
      h.span({}, 0),
      h.span({}, 0, 1)
    );
    expect(vnode).toMatchInlineSnapshot(`
      {
        "child": {
          "children": [
            {
              "key": "abc",
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
              "data": "0",
              "type": "text",
            },
            {
              "key": undefined,
              "props": {
                "children": {
                  "type": "empty",
                },
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
              "key": 0,
              "name": "span",
              "props": {
                "className": "text-red",
              },
              "ref": [Function],
              "type": "tag",
            },
            {
              "child": {
                "data": "0",
                "type": "text",
              },
              "key": undefined,
              "name": "span",
              "props": {},
              "ref": undefined,
              "type": "tag",
            },
            {
              "child": {
                "children": [
                  {
                    "data": "0",
                    "type": "text",
                  },
                  {
                    "data": "1",
                    "type": "text",
                  },
                ],
                "type": "fragment",
              },
              "key": undefined,
              "name": "span",
              "props": {},
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
  });
});
