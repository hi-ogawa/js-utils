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
                  "type": Symbol(empty),
                },
                "value": "hello",
              },
              "render": [Function],
              "type": Symbol(custom),
            },
            {
              "type": Symbol(empty),
            },
            {
              "data": "0",
              "type": Symbol(text),
            },
            {
              "key": undefined,
              "props": {
                "children": {
                  "type": Symbol(empty),
                },
              },
              "render": [Function],
              "type": Symbol(custom),
            },
            {
              "type": Symbol(empty),
            },
            {
              "child": {
                "data": "world",
                "type": Symbol(text),
              },
              "key": 0,
              "name": "span",
              "props": {
                "className": "text-red",
              },
              "ref": [Function],
              "type": Symbol(tag),
            },
            {
              "child": {
                "data": "0",
                "type": Symbol(text),
              },
              "key": undefined,
              "name": "span",
              "props": {},
              "ref": undefined,
              "type": Symbol(tag),
            },
            {
              "child": {
                "children": [
                  {
                    "data": "0",
                    "type": Symbol(text),
                  },
                  {
                    "data": "1",
                    "type": Symbol(text),
                  },
                ],
                "type": Symbol(fragment),
              },
              "key": undefined,
              "name": "span",
              "props": {},
              "ref": undefined,
              "type": Symbol(tag),
            },
          ],
          "type": Symbol(fragment),
        },
        "key": undefined,
        "name": "div",
        "props": {
          "className": "flex",
        },
        "ref": undefined,
        "type": Symbol(tag),
      }
    `);
  });
});
