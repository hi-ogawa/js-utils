import { expect, test } from "vitest";

test("basic", () => {
  expect(
    <div id="hi">
      hey<span className="hehe">yay</span>
      <>
        frag<pre>ment</pre>
      </>
    </div>,
  ).toMatchInlineSnapshot(`
    {
      "key": undefined,
      "name": "div",
      "props": {
        "children": [
          "hey",
          {
            "key": undefined,
            "name": "span",
            "props": {
              "children": "yay",
              "className": "hehe",
            },
            "type": "tag",
          },
          {
            "key": undefined,
            "props": {
              "children": [
                "frag",
                {
                  "key": undefined,
                  "name": "pre",
                  "props": {
                    "children": "ment",
                  },
                  "type": "tag",
                },
              ],
            },
            "render": [Function],
            "type": "custom",
          },
        ],
        "id": "hi",
      },
      "type": "tag",
    }
  `);
});
