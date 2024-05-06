import { expect, test } from "vitest";

test("basic", () => {
  expect(
    <div id="hi">
      hey<span className="hehe">yay</span>
      <>
        frag<pre>ment</pre>
      </>
    </div>
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
            "type": Symbol(tiny-react.tag),
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
                  "type": Symbol(tiny-react.tag),
                },
              ],
            },
            "render": [Function],
            "type": Symbol(tiny-react.custom),
          },
        ],
        "id": "hi",
      },
      "type": Symbol(tiny-react.tag),
    }
  `);
});
