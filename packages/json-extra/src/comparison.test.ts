import superjson from "superjson";
import { describe, expect, it } from "vitest";

describe("superjson", () => {
  it("basic", () => {
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

    const stringified = JSON.stringify(superjson.serialize(original), null, 2);
    expect(stringified).toMatchInlineSnapshot(`
      "{
        \\"json\\": [
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
          null,
          \\"Infinity\\",
          \\"-Infinity\\",
          \\"NaN\\",
          0,
          \\"-0\\",
          \\"2023-08-17T00:00:00.000Z\\",
          \\"1234\\",
          \\"/^\\\\\\\\d+/gms\\",
          [
            [
              0,
              \\"1970-01-01T00:00:00.000Z\\"
            ],
            [
              \\"1\\",
              [
                \\"/a/g\\"
              ]
            ]
          ],
          [
            0,
            \\"1970-01-01T00:00:00.000Z\\",
            [
              [
                \\"1\\",
                \\"/a/g\\"
              ]
            ]
          ],
          [
            \\"!NaN\\",
            \\"collision\\"
          ]
        ],
        \\"meta\\": {
          \\"values\\": {
            \\"6\\": [
              \\"undefined\\"
            ],
            \\"7\\": [
              \\"number\\"
            ],
            \\"8\\": [
              \\"number\\"
            ],
            \\"9\\": [
              \\"number\\"
            ],
            \\"11\\": [
              \\"number\\"
            ],
            \\"12\\": [
              \\"Date\\"
            ],
            \\"13\\": [
              \\"bigint\\"
            ],
            \\"14\\": [
              \\"regexp\\"
            ],
            \\"15\\": [
              \\"map\\",
              {
                \\"0.1\\": [
                  \\"Date\\"
                ],
                \\"1.0\\": [
                  \\"bigint\\"
                ],
                \\"1.1\\": [
                  \\"set\\",
                  {
                    \\"0\\": [
                      \\"regexp\\"
                    ]
                  }
                ]
              }
            ],
            \\"16\\": [
              \\"set\\",
              {
                \\"1\\": [
                  \\"Date\\"
                ],
                \\"2\\": [
                  \\"map\\",
                  {
                    \\"0.0\\": [
                      \\"bigint\\"
                    ],
                    \\"0.1\\": [
                      \\"regexp\\"
                    ]
                  }
                ]
              }
            ]
          },
          \\"referentialEqualities\\": {
            \\"15.1.0\\": [
              \\"16.2.0.0\\"
            ]
          }
        }
      }"
    `);

    const revivied = superjson.parse(stringified);
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
        undefined,
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
});

describe("brillout-json-serializer", () => {
  it("basic", async () => {
    const { parse } = await import("@brillout/json-serializer/parse");
    const { stringify } = await import("@brillout/json-serializer/stringify");

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

    const stringified = stringify(original, { space: 2 });

    // custom container is not human-readable
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
        \\"!undefined\\",
        \\"!Infinity\\",
        \\"!-Infinity\\",
        \\"!NaN\\",
        0,
        0,
        \\"!Date:2023-08-17T00:00:00.000Z\\",
        \\"!BigInt:1234\\",
        \\"!RegExp:/^\\\\\\\\d+/gms\\",
        \\"!Map:[\\\\n  [\\\\n    0,\\\\n    \\\\\\"!Date:1970-01-01T00:00:00.000Z\\\\\\"\\\\n  ],\\\\n  [\\\\n    \\\\\\"!BigInt:1\\\\\\",\\\\n    \\\\\\"!Set:[\\\\\\\\n  \\\\\\\\\\\\\\"!RegExp:/a/g\\\\\\\\\\\\\\"\\\\\\\\n]\\\\\\"\\\\n  ]\\\\n]\\",
        \\"!Set:[\\\\n  0,\\\\n  \\\\\\"!Date:1970-01-01T00:00:00.000Z\\\\\\",\\\\n  \\\\\\"!Map:[\\\\\\\\n  [\\\\\\\\n    \\\\\\\\\\\\\\"!BigInt:1\\\\\\\\\\\\\\",\\\\\\\\n    \\\\\\\\\\\\\\"!RegExp:/a/g\\\\\\\\\\\\\\"\\\\\\\\n  ]\\\\\\\\n]\\\\\\"\\\\n]\\",
        [
          \\"!!NaN\\",
          \\"collision\\"
        ]
      ]"
    `);

    const revivied = parse(stringified);
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
        undefined,
        Infinity,
        -Infinity,
        NaN,
        0,
        0,
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
    // -0 doesn't roundtrip
    expect(revivied).not.toEqual(original);

    (revivied as any)[13] = -0;
    expect(revivied).not.toEqual(original);
  });
});
