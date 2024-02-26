import { describe, expect, it } from "vitest";
import { replaceReference, reviveReference } from "./reference";

describe("reference", () => {
  it("basic", () => {
    const v1 = { hi: 0 };
    const v = [v1, [v1], { foo: v1 }];
    const replaced = replaceReference(v);
    expect(replaced).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          [
            "!",
            1,
          ],
        ],
        {
          "foo": [
            "!",
            1,
          ],
        },
      ]
    `);
    const u = reviveReference(replaced) as any;
    expect(u).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          {
            "hi": 0,
          },
        ],
        {
          "foo": {
            "hi": 0,
          },
        },
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
    expect(u[0]).toBe(u[2].foo);
  });

  it("two", () => {
    const v1 = { hi: 0 };
    const v2 = { hey: 1, yo: v1 };
    const v = [v1, [v1], { ...v1 }, v2, { foo: v1, bar: [v2] }];
    const replaced = replaceReference(v);
    expect(replaced).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          [
            "!",
            1,
          ],
        ],
        {
          "hi": 0,
        },
        {
          "hey": 1,
          "yo": [
            "!",
            1,
          ],
        },
        {
          "bar": [
            [
              "!",
              4,
            ],
          ],
          "foo": [
            "!",
            1,
          ],
        },
      ]
    `);
    const u = reviveReference(replaced) as any;
    expect(u).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          {
            "hi": 0,
          },
        ],
        {
          "hi": 0,
        },
        {
          "hey": 1,
          "yo": {
            "hi": 0,
          },
        },
        {
          "bar": [
            {
              "hey": 1,
              "yo": {
                "hi": 0,
              },
            },
          ],
          "foo": {
            "hi": 0,
          },
        },
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
    expect(u[0]).not.toBe(u[2]);
    expect(u[3]).toBe(u[4].bar[0]);
  });

  it("cyclic", () => {
    const v: any = [];
    v[0] = v;
    v[1] = { hi: v };
    const replaced = replaceReference(v);
    expect(replaced).toMatchInlineSnapshot(`
      [
        [
          "!",
          0,
        ],
        {
          "hi": [
            "!",
            0,
          ],
        },
      ]
    `);
    const u = reviveReference(replaced) as any;
    expect(u).toMatchInlineSnapshot(`
      [
        [Circular],
        {
          "hi": [Circular],
        },
      ]
    `);
    expect(u).toBe(u[0]);
    expect(u).toBe(u[1].hi);
  });

  it("collision", () => {
    const v1 = { hi: 0 };
    const v2 = ["!", v1];
    const v = [
      v1,
      [v1],
      ["!"],
      v2,
      ["!", { "!": v1 }],
      ["!", "!", "!"],
      ["!", v2],
    ];
    const replaced = replaceReference(v);
    expect(replaced).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          [
            "!",
            1,
          ],
        ],
        [
          "!",
        ],
        [
          "!",
          "!",
          [
            "!",
            1,
          ],
        ],
        [
          "!",
          "!",
          {
            "!": [
              "!",
              1,
            ],
          },
        ],
        [
          "!",
          "!",
          "!",
          "!",
        ],
        [
          "!",
          "!",
          [
            "!",
            4,
          ],
        ],
      ]
    `);
    const u = reviveReference(replaced) as any;
    expect(u).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          {
            "hi": 0,
          },
        ],
        [
          "!",
        ],
        [
          "!",
          {
            "hi": 0,
          },
        ],
        [
          "!",
          {
            "!": {
              "hi": 0,
            },
          },
        ],
        [
          "!",
          "!",
          "!",
        ],
        [
          "!",
          [
            "!",
            {
              "hi": 0,
            },
          ],
        ],
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
    expect(u[0]).toBe(u[3][1]);
    expect(u[0]).toBe(u[4][1]["!"]);
  });
});
