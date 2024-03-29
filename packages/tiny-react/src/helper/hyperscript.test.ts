import { describe, expect, it } from "vitest";
import { Fragment } from "../virtual-dom";
import { h } from "./hyperscript";

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
      h.span({}, 0, 1),
      h.span({}, [0]),
      h.span({}, [0, 1])
    );
    expect(vnode).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "name": "div",
        "props": {
          "children": [
            {
              "key": "abc",
              "props": {
                "value": "hello",
              },
              "render": [Function],
              "type": "custom",
            },
            null,
            0,
            {
              "key": undefined,
              "props": {},
              "render": [Function],
              "type": "custom",
            },
            undefined,
            {
              "key": 0,
              "name": "span",
              "props": {
                "children": "world",
                "className": "text-red",
                "ref": [Function],
              },
              "type": "tag",
            },
            {
              "key": undefined,
              "name": "span",
              "props": {
                "children": 0,
              },
              "type": "tag",
            },
            {
              "key": undefined,
              "name": "span",
              "props": {
                "children": [
                  0,
                  1,
                ],
              },
              "type": "tag",
            },
            {
              "key": undefined,
              "name": "span",
              "props": {
                "children": [
                  0,
                ],
              },
              "type": "tag",
            },
            {
              "key": undefined,
              "name": "span",
              "props": {
                "children": [
                  0,
                  1,
                ],
              },
              "type": "tag",
            },
          ],
          "className": "flex",
        },
        "type": "tag",
      }
    `);
  });

  it("children", () => {
    expect(h(Fragment, {})).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {},
        "render": [Function],
        "type": "custom",
      }
    `);
    expect(h(Fragment, {}, 1)).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {
          "children": 1,
        },
        "render": [Function],
        "type": "custom",
      }
    `);
    expect(h(Fragment, { children: 1 })).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {
          "children": 1,
        },
        "render": [Function],
        "type": "custom",
      }
    `);
    expect(h(Fragment, { children: [1] })).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {
          "children": [
            1,
          ],
        },
        "render": [Function],
        "type": "custom",
      }
    `);
    expect(h(Fragment, { children: 1 }, 2)).toMatchInlineSnapshot(`
      {
        "key": undefined,
        "props": {
          "children": 2,
        },
        "render": [Function],
        "type": "custom",
      }
    `);
  });
});
