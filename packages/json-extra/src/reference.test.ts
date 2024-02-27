import { tinyassert } from "@hiogawa/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import { createJsonExtra2, definePlugin } from "./reference";

// instantiate default one for tests
const jsonExtra = createJsonExtra2({ builtins: true });

function runJsonExtra(input: unknown, json = jsonExtra) {
  const stringified = json.stringify(input, null, 2);
  const parsed = json.parse(stringified);
  const serialized = json.serialize(input);
  const deserialized = json.deserialize(serialized);
  return { input, stringified, parsed, serialized, deserialized };
}

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
                2,
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

  it("edge cases 1", () => {
    const v = new Set(["!", null]);
    const result = runJsonExtra(v);
    expect(result.serialized).toMatchInlineSnapshot(`
      [
        "!Set",
        [
          "!",
          null,
        ],
      ]
    `);
    expect(result.deserialized).toMatchInlineSnapshot(`
      Set {
        "!",
        null,
      }
    `);
    expect(result.deserialized).toEqual(v);
  });

  it("edge cases 2", () => {
    const v = new Set(["!x", null]);
    const result = runJsonExtra(v);
    expect(result.serialized).toMatchInlineSnapshot(`
      [
        "!Set",
        [
          "!x",
          null,
        ],
      ]
    `);
    expect(result.deserialized).toMatchInlineSnapshot(`
      Set {
        "!x",
        null,
      }
    `);
    expect(result.deserialized).toEqual(v);
  });
});

describe("fuzzing", () => {
  it("jsonValue", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (data) => {
        const result = runJsonExtra(data);
        expect(result.parsed).toEqual(data);
        expect(result.deserialized).toEqual(data);
      })
    );
  });

  it("anything", () => {
    fc.assert(
      fc.property(
        fc.anything({
          withBigInt: true,
          withDate: true,
          withMap: true,
          withSet: true,
        }),
        (data) => {
          const result = runJsonExtra(data);
          expect(result.parsed).toEqual(data);
          expect(result.deserialized).toEqual(data);
        }
      )
    );
  });
});

describe("old tests", () => {
  it("basic", () => {
    const input = [
      // standard json value
      null,
      true,
      123,
      "string",
      ["array"],
      { k: "v" },
      // special constants
      undefined,
      Infinity,
      -Infinity,
      NaN,
      0,
      -0,
      // extra types
      new Date("2023-08-17"),
      1234n,
      /^\d+/gms,
      // extra containers
      new Map<any, any>([
        [0, new Date(0)],
        [1n, new Set([/a/g])],
      ]),
      new Set<any>([0, new Date(0), new Map([[1n, /a/g]])]),
      // escape
      ["!NaN", "collision"],
    ];
    const result = runJsonExtra(input);
    expect(result.stringified).toMatchSnapshot();
    expect(result.parsed).toEqual(input);
  });

  it("custom type", () => {
    const jsonExtra = createJsonExtra2({
      plugins: {
        ZodError: definePlugin<ZodError>({
          type: "simple",
          is: (v): v is ZodError => v instanceof ZodError,
          replace: (v) => v.issues,
          revive: (s) => new ZodError(s as any),
        }),
      },
    });

    const error = z.object({ int: z.number().int() }).safeParse({ int: 1.23 });
    tinyassert(!error.success);

    const input = {
      ok: false,
      value: error.error,
    };
    const result = runJsonExtra(input, jsonExtra);
    expect(result.serialized).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [
          "!ZodError",
          [
            {
              "code": "invalid_type",
              "expected": "integer",
              "message": "Expected integer, received float",
              "path": [
                "int",
              ],
              "received": "float",
            },
          ],
        ],
      }
    `);
    expect(result.deserialized).toEqual(input);
  });

  it("selected builtins", () => {
    const jsonExtra = createJsonExtra2({ builtins: ["undefined", "Date"] });
    const input = [undefined, new Date("2023-08-17"), NaN, new Set([0, 1])];
    const result = runJsonExtra(input, jsonExtra);
    expect(result.stringified).toMatchInlineSnapshot(`
      "[
        [
          "!undefined",
          0
        ],
        [
          "!Date",
          "2023-08-17T00:00:00.000Z"
        ],
        null,
        {}
      ]"
    `);
    expect(result.parsed).toMatchInlineSnapshot(`
      [
        undefined,
        2023-08-17T00:00:00.000Z,
        null,
        {},
      ]
    `);
  });

  it("escape collision", () => {
    const input = {
      collision2: ["!", 1n],
      collision3: ["!", ["!", 0]],
      collision4: ["!", ["!", 1n, "!"]],
      collision5: [[], ["!"], ["!", 0], ["!", 0, 0], ["!", 0, 0, 0]],
    };
    const result = runJsonExtra(input);
    expect(result.serialized).toMatchSnapshot();
    expect(result.deserialized).toEqual(input);
  });

  it("edge cases", () => {
    // edge cases which don't roundtrip
    // - function
    // - custom class
    // - custom toJSON

    class X {
      name = "hello";
    }

    class Y {
      toJSON() {
        return "foo";
      }
    }

    const input = [
      Symbol("unique"),
      Symbol.for("named"),
      new X(),
      new Y(),
      {
        toJSON: () => "zzz",
      },
      {
        toJSON: "www",
      },
      {
        toJSON: () => () => "uuu",
      },
      () => {},
    ];

    const result = runJsonExtra(input);
    expect(result).toMatchSnapshot();
  });
});
