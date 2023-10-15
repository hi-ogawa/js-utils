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
                "children": null,
                "value": "hello",
              },
              "render": [Function],
              "type": 2,
            },
            null,
            "0",
            {
              "key": undefined,
              "props": {
                "children": null,
              },
              "render": [Function],
              "type": 2,
            },
            null,
            {
              "child": "world",
              "key": 0,
              "name": "span",
              "props": {
                "className": "text-red",
              },
              "ref": [Function],
              "type": 0,
            },
            {
              "child": "0",
              "key": undefined,
              "name": "span",
              "props": {},
              "ref": undefined,
              "type": 0,
            },
            {
              "child": {
                "children": [
                  "0",
                  "1",
                ],
                "type": 3,
              },
              "key": undefined,
              "name": "span",
              "props": {},
              "ref": undefined,
              "type": 0,
            },
          ],
          "type": 3,
        },
        "key": undefined,
        "name": "div",
        "props": {
          "className": "flex",
        },
        "ref": undefined,
        "type": 0,
      }
    `);
  });
});
