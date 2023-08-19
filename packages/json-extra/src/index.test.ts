import { tinyassert } from "@hiogawa/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";
import {
  createJsonExtra,
  defineJsonExtraExtension,
  jsonParseReviveUndefined,
} from ".";

describe(createJsonExtra, () => {
  it("basic", () => {
    const jsonExtra = createJsonExtra({ builtins: true });

    const original = [
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

    const stringified = jsonExtra.stringify(original, null, 2);
    expect(stringified).toMatchInlineSnapshot(`
      "[
        null,
        true,
        123,
        \\"string\\",
        [
          \\"array\\"
        ],
        {
          \\"k\\": \\"v\\"
        },
        [
          \\"!undefined\\",
          0
        ],
        [
          \\"!Infinity\\",
          0
        ],
        [
          \\"!-Infinity\\",
          0
        ],
        [
          \\"!NaN\\",
          0
        ],
        0,
        [
          \\"!-0\\",
          0
        ],
        [
          \\"!Date\\",
          \\"2023-08-17T00:00:00.000Z\\"
        ],
        [
          \\"!BigInt\\",
          \\"1234\\"
        ],
        [
          \\"!RegExp\\",
          [
            \\"^\\\\\\\\d+\\",
            \\"gms\\"
          ]
        ],
        [
          \\"!Map\\",
          [
            [
              0,
              [
                \\"!Date\\",
                \\"1970-01-01T00:00:00.000Z\\"
              ]
            ],
            [
              [
                \\"!BigInt\\",
                \\"1\\"
              ],
              [
                \\"!Set\\",
                [
                  [
                    \\"!RegExp\\",
                    [
                      \\"a\\",
                      \\"g\\"
                    ]
                  ]
                ]
              ]
            ]
          ]
        ],
        [
          \\"!Set\\",
          [
            0,
            [
              \\"!Date\\",
              \\"1970-01-01T00:00:00.000Z\\"
            ],
            [
              \\"!Map\\",
              [
                [
                  [
                    \\"!BigInt\\",
                    \\"1\\"
                  ],
                  [
                    \\"!RegExp\\",
                    [
                      \\"a\\",
                      \\"g\\"
                    ]
                  ]
                ]
              ]
            ]
          ]
        ],
        [
          \\"!\\",
          \\"!NaN\\",
          \\"collision\\"
        ]
      ]"
    `);

    const revivied = jsonExtra.parse(stringified);
    expect(revivied).toMatchInlineSnapshot(`
      [
        null,
        true,
        123,
        "string",
        [
          "array",
        ],
        {
          "k": "v",
        },
        ,
        Infinity,
        -Infinity,
        NaN,
        0,
        -0,
        2023-08-17T00:00:00.000Z,
        1234n,
        /\\^\\\\d\\+/gms,
        Map {
          0 => 1970-01-01T00:00:00.000Z,
          1n => Set {
            /a/g,
          },
        },
        Set {
          0,
          1970-01-01T00:00:00.000Z,
          Map {
            1n => /a/g,
          },
        },
        [
          "!NaN",
          "collision",
        ],
      ]
    `);
    expect(revivied).toEqual(original);
  });

  it("custom type", () => {
    const jsonExtra = createJsonExtra({
      extensions: {
        ZodError: defineJsonExtraExtension<ZodError>({
          is: (v): v is ZodError => v instanceof ZodError,
          replacer: (v) => v.issues,
          reviver: (s) => new ZodError(s as any),
        }),
      },
      builtins: [],
    });

    const error = z.object({ int: z.number().int() }).safeParse({ int: 1.23 });
    tinyassert(!error.success);

    const original = {
      ok: false,
      value: error.error,
    };

    const stringified = jsonExtra.stringify(original, null, 2);
    expect(stringified).toMatchInlineSnapshot(
      `
      "{
        \\"ok\\": false,
        \\"value\\": [
          \\"!ZodError\\",
          [
            {
              \\"code\\": \\"invalid_type\\",
              \\"expected\\": \\"integer\\",
              \\"received\\": \\"float\\",
              \\"message\\": \\"Expected integer, received float\\",
              \\"path\\": [
                \\"int\\"
              ]
            }
          ]
        ]
      }"
    `
    );
    const revived = jsonExtra.parse(stringified);
    expect(revived).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [ZodError: [
        {
          "code": "invalid_type",
          "expected": "integer",
          "received": "float",
          "message": "Expected integer, received float",
          "path": [
            "int"
          ]
        }
      ]],
      }
    `);
    expect(revived).toEqual(original);
  });

  it("selected builtins", () => {
    const jsonExtra = createJsonExtra({ builtins: ["undefined", "Date"] });
    jsonExtra.parse;

    const original = [undefined, new Date("2023-08-17"), NaN, new Set([0, 1])];
    expect(original).toMatchInlineSnapshot(`
      [
        undefined,
        2023-08-17T00:00:00.000Z,
        NaN,
        Set {
          0,
          1,
        },
      ]
    `);

    const stringified = jsonExtra.stringify(original, null, 2);
    expect(stringified).toMatchInlineSnapshot(`
      "[
        [
          \\"!undefined\\",
          0
        ],
        [
          \\"!Date\\",
          \\"2023-08-17T00:00:00.000Z\\"
        ],
        null,
        {}
      ]"
    `);

    const revived = jsonExtra.parse(stringified);
    expect(revived).toMatchInlineSnapshot(`
      [
        ,
        2023-08-17T00:00:00.000Z,
        null,
        {},
      ]
    `);
  });

  it("escape-collision", () => {
    const jsonExtra = createJsonExtra({ builtins: true });

    const original = {
      collision2: ["!", 1n],
      collision3: ["!", ["!", 0]],
      collision4: ["!", ["!", 1n, "!"]],
      collision5: [[], ["!"], ["!", 0], ["!", 0, 0], ["!", 0, 0, 0]],
    };

    const stringified = jsonExtra.stringify(original, null, 2);
    expect(stringified).toMatchInlineSnapshot(`
      "{
        \\"collision2\\": [
          \\"!\\",
          \\"!\\",
          [
            \\"!BigInt\\",
            \\"1\\"
          ]
        ],
        \\"collision3\\": [
          \\"!\\",
          \\"!\\",
          [
            \\"!\\",
            \\"!\\",
            0
          ]
        ],
        \\"collision4\\": [
          \\"!\\",
          \\"!\\",
          [
            \\"!\\",
            \\"!\\",
            [
              \\"!BigInt\\",
              \\"1\\"
            ],
            \\"!\\"
          ]
        ],
        \\"collision5\\": [
          [],
          [
            \\"!\\"
          ],
          [
            \\"!\\",
            \\"!\\",
            0
          ],
          [
            \\"!\\",
            \\"!\\",
            0,
            0
          ],
          [
            \\"!\\",
            \\"!\\",
            0,
            0,
            0
          ]
        ]
      }"
    `);

    const revived = jsonExtra.parse(stringified);
    expect(revived).toMatchInlineSnapshot(`
      {
        "collision2": [
          "!",
          1n,
        ],
        "collision3": [
          "!",
          [
            "!",
            0,
          ],
        ],
        "collision4": [
          "!",
          [
            "!",
            1n,
            "!",
          ],
        ],
        "collision5": [
          [],
          [
            "!",
          ],
          [
            "!",
            0,
          ],
          [
            "!",
            0,
            0,
          ],
          [
            "!",
            0,
            0,
            0,
          ],
        ],
      }
    `);
    expect(revived).toEqual(original);
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

    const original = [
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

    const jsonExtra = createJsonExtra({ builtins: true });
    expect(original).toMatchInlineSnapshot(`
      [
        Symbol(unique),
        Symbol(named),
        X {
          "name": "hello",
        },
        "foo",
        "zzz",
        {
          "toJSON": "www",
        },
        [Function],
        [Function],
      ]
    `);

    const stringified = jsonExtra.stringify(original, null, 2);
    expect(stringified).toMatchInlineSnapshot(`
      "[
        null,
        null,
        {
          \\"name\\": \\"hello\\"
        },
        \\"foo\\",
        \\"zzz\\",
        {
          \\"toJSON\\": \\"www\\"
        },
        null,
        null
      ]"
    `);

    const revived = jsonExtra.parse(stringified);
    expect(revived).toMatchInlineSnapshot(`
      [
        null,
        null,
        {
          "name": "hello",
        },
        "foo",
        "zzz",
        {
          "toJSON": "www",
        },
        null,
        null,
      ]
    `);
  });

  it("cyclic", () => {
    const original: any[] = [];
    original[0] = original;

    const jsonExtra = createJsonExtra({ builtins: true });
    expect(original).toMatchInlineSnapshot(`
      [
        [Circular],
      ]
    `);

    expect(() => jsonExtra.stringify(original, null, 2))
      .toThrowErrorMatchingInlineSnapshot(`
      "Converting circular structure to JSON
          --> starting at object with constructor 'Array'
          --- index 0 closes the circle"
    `);
  });

  describe("undefined", () => {
    it("top-value", () => {
      const jsonExtra = createJsonExtra({ builtins: true });
      const result = testStringifyAndParse(undefined, jsonExtra);
      expect(result).toMatchInlineSnapshot(`
        {
          "original": undefined,
          "revived": undefined,
          "revivedUndefined": undefined,
          "stringified": "[
          \\"!undefined\\",
          0
        ]",
        }
      `);
      expect(result.revived).toEqual(result.original);
    });

    it("property", () => {
      const jsonExtra = createJsonExtra({ builtins: true });
      const result = testStringifyAndParse({ prop: undefined }, jsonExtra);
      expect(result).toMatchInlineSnapshot(`
        {
          "original": {
            "prop": undefined,
          },
          "revived": {},
          "revivedUndefined": {
            "prop": undefined,
          },
          "stringified": "{
          \\"prop\\": [
            \\"!undefined\\",
            0
          ]
        }",
        }
      `);
      expect(result.revived).toEqual(result.original);
      expect(result.revivedUndefined).toEqual(result.original);
    });

    it("array", () => {
      const jsonExtra = createJsonExtra({ builtins: true });
      const result = testStringifyAndParse([undefined], jsonExtra);
      expect(result).toMatchInlineSnapshot(`
        {
          "original": [
            undefined,
          ],
          "revived": [
            ,
          ],
          "revivedUndefined": [
            undefined,
          ],
          "stringified": "[
          [
            \\"!undefined\\",
            0
          ]
        ]",
        }
      `);
      expect(result.revived).toEqual(result.original);
      expect(result.revivedUndefined).toEqual(result.original);
    });
  });

  describe("fuzzing", () => {
    const jsonExtra = createJsonExtra({ builtins: true });

    it("jsonValue", () => {
      fc.assert(
        fc.property(fc.jsonValue(), (data) => {
          const stringified = jsonExtra.stringify(data);
          const revivied = jsonExtra.parse(stringified);
          expect(revivied).toEqual(data);
        }),
        // TODO: more runs on CI?
        { verbose: true, numRuns: 10 ** 3 }
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
            const stringified = jsonExtra.stringify(data);
            const revivied = jsonExtra.parse(stringified);
            expect(revivied).toEqual(data);
          }
        ),
        { verbose: true, numRuns: 10 ** 3 }
      );
    });
  });
});

function testStringifyAndParse(
  original: unknown,
  jsonExtra: ReturnType<typeof createJsonExtra>
) {
  const stringified = jsonExtra.stringify(original, null, 2);
  const revived = jsonExtra.parse(stringified);
  const revivedUndefined = jsonParseReviveUndefined(
    stringified,
    jsonExtra.reviver
  );
  return { original, stringified, revived, revivedUndefined };
}
