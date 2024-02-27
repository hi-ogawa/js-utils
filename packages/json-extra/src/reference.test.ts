import { describe, expect, it } from "vitest";
import { createJsonExtra2 } from "./reference";

const jsonExtra = createJsonExtra2({ builtins: true });

describe("reference", () => {
  it("basic", () => {
    const v1 = { hi: 0 };
    const v = [v1, [v1], { foo: v1 }];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
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
    const u = jsonExtra.deserialize(serialized);
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
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
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
    const u = jsonExtra.deserialize(serialized);
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
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
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
    const u = jsonExtra.deserialize(serialized);
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

  it("collision 1", () => {
    const v1 = { hi: 0 };
    const v2 = ["!", v1];
    const v = [v1, v2, v2];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
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
          2,
        ],
      ]
    `);
    const u = jsonExtra.deserialize(serialized);
    expect(u).toMatchInlineSnapshot(`
      [
        {
          "hi": 0,
        },
        [
          "!",
          {
            "hi": 0,
          },
        ],
        [
          "!",
          {
            "hi": 0,
          },
        ],
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][1]);
    expect(u[1]).toBe(u[2]);
  });

  it("collision 2", () => {
    const v1 = { hi: 0 };
    const v2 = ["!", v1];
    const v = [
      v1,
      [v1],
      ["!"],
      v2,
      ["!", { "!": v1 }],
      ["!!", "!", "!"],
      ["!", v2],
    ];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
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
          "!!",
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
    const u = jsonExtra.deserialize(serialized);
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
          "!!",
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

  it("custom single", () => {
    const v1 = new Date("2000-01-01T00:00:00Z");
    const v2 = /^\d+/gms;
    const v3 = [v1, v2];
    const v = [v1, [v1], { foo: [v1, v2] }, v2, v3, v3];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
      [
        [
          "!Date",
          "2000-01-01T00:00:00.000Z",
        ],
        [
          [
            "!",
            1,
          ],
        ],
        {
          "foo": [
            [
              "!",
              1,
            ],
            [
              "!RegExp",
              [
                "^\\d+",
                "gms",
              ],
            ],
          ],
        },
        [
          "!",
          5,
        ],
        [
          [
            "!",
            1,
          ],
          [
            "!",
            5,
          ],
        ],
        [
          "!",
          6,
        ],
      ]
    `);
    const u = jsonExtra.deserialize(serialized);
    expect(u).toMatchInlineSnapshot(`
      [
        2000-01-01T00:00:00.000Z,
        [
          2000-01-01T00:00:00.000Z,
        ],
        {
          "foo": [
            2000-01-01T00:00:00.000Z,
            /\\^\\\\d\\+/gms,
          ],
        },
        /\\^\\\\d\\+/gms,
        [
          2000-01-01T00:00:00.000Z,
          /\\^\\\\d\\+/gms,
        ],
        [
          2000-01-01T00:00:00.000Z,
          /\\^\\\\d\\+/gms,
        ],
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
    expect(u[0]).toBe(u[2].foo[0]);
    expect(u[3]).toBe(u[2].foo[1]);
  });

  it("custom constant", () => {
    const v1 = [undefined, Infinity, NaN];
    const v = [v1, [v1], undefined, new Date(1), Infinity, new Date(0)];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
      [
        [
          [
            "!undefined",
            0,
          ],
          [
            "!Infinity",
            0,
          ],
          [
            "!NaN",
            0,
          ],
        ],
        [
          [
            "!",
            1,
          ],
        ],
        [
          "!undefined",
          0,
        ],
        [
          "!Date",
          "1970-01-01T00:00:00.001Z",
        ],
        [
          "!Infinity",
          0,
        ],
        [
          "!Date",
          "1970-01-01T00:00:00.000Z",
        ],
      ]
    `);
    const u = jsonExtra.deserialize(serialized);
    expect(u).toMatchInlineSnapshot(`
      [
        [
          undefined,
          Infinity,
          NaN,
        ],
        [
          [
            undefined,
            Infinity,
            NaN,
          ],
        ],
        undefined,
        1970-01-01T00:00:00.001Z,
        Infinity,
        1970-01-01T00:00:00.000Z,
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
  });

  it("custom container 1", () => {
    const v1 = new Date("2000-01-01T00:00:00Z");
    const v2 = new Set([v1, { foo: v1 }]);
    const v = [v2, [v2]];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
      [
        [
          "!Set",
          [
            [
              "!Date",
              "2000-01-01T00:00:00.000Z",
            ],
            {
              "foo": [
                "!",
                3,
              ],
            },
          ],
        ],
        [
          [
            "!",
            1,
          ],
        ],
      ]
    `);
    const u = jsonExtra.deserialize(serialized);
    expect(u).toMatchInlineSnapshot(`
      [
        Set {
          2000-01-01T00:00:00.000Z,
          {
            "foo": 2000-01-01T00:00:00.000Z,
          },
        },
        [
          Set {
            2000-01-01T00:00:00.000Z,
            {
              "foo": 2000-01-01T00:00:00.000Z,
            },
          },
        ],
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
    const [x, y] = [...u[0]];
    expect(x).toBe(y.foo);
  });

  it("custom container cyclic", () => {
    const v1 = new Set(["hi" as any]);
    v1.add(v1);
    const v = [v1, [v1]];
    const serialized = jsonExtra.serialize(v);
    expect(serialized).toMatchInlineSnapshot(`
      [
        [
          "!Set",
          [
            "hi",
            [
              "!",
              1,
            ],
          ],
        ],
        [
          [
            "!",
            1,
          ],
        ],
      ]
    `);
    const u = jsonExtra.deserialize(serialized);
    expect(u).toMatchInlineSnapshot(`
      [
        Set {
          "hi",
          [Circular],
        },
        [
          Set {
            "hi",
            [Circular],
          },
        ],
      ]
    `);
    expect(u).toEqual(v);
    expect(u[0]).toBe(u[1][0]);
    expect(u[0]).toBe([...u[0]][1]);
  });
});
