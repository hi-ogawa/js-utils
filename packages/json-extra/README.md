# json-extra

Simple and trivial alternative for
[`@brillout/json-serializer`](https://github.com/brillout/json-serializer/),
[`superjson`](https://github.com/blitz-js/superjson), etc...

Core ideas are based on [`@brillout/json-serializer`](https://github.com/brillout/json-serializer/)
but it employs an array-based encoding for special values,
which makes it easy to support custom types
and also provides human-readibility for custom containers.

## examples

See also `./src/*.test.ts`

```ts
import { stringify as brilloutStringify } from "@brillout/json-serializer/stringify";
import { createJsonExtra } from "@hiogawa/json-extra";
import superjson from "superjson";

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

  // escape encoding collision
  ["!NaN", "collision"],
];

const jsonExtra = createJsonExtra({ builtins: true });
console.log(jsonExtra.stringify(original, null, 2));

console.log(brilloutStringify(original, { space: 2 }));

console.log(JSON.stringify(superjson.serialize(original), null, 2));
```

<!--
%template-in-begin:example%

{% npx tsx ./src/example.ts %}

%template-in-end:example%
-->

<!-- %template-out-begin:example% -->

<details><summary>@hiogawa/json-extra</summary>

<!-- prettier-ignore -->
```json
[
  null,
  true,
  123,
  "string",
  [
    "array"
  ],
  {
    "k": "v"
  },
  [
    "!undefined",
    0
  ],
  [
    "!Infinity",
    0
  ],
  [
    "!-Infinity",
    0
  ],
  [
    "!NaN",
    0
  ],
  0,
  [
    "!-0",
    0
  ],
  [
    "!Date",
    "2023-08-17T00:00:00.000Z"
  ],
  [
    "!BigInt",
    "1234"
  ],
  [
    "!RegExp",
    [
      "^\\d+",
      "gms"
    ]
  ],
  [
    "!Map",
    [
      [
        0,
        [
          "!Date",
          "1970-01-01T00:00:00.000Z"
        ]
      ],
      [
        [
          "!BigInt",
          "1"
        ],
        [
          "!Set",
          [
            [
              "!RegExp",
              [
                "a",
                "g"
              ]
            ]
          ]
        ]
      ]
    ]
  ],
  [
    "!Set",
    [
      0,
      [
        "!Date",
        "1970-01-01T00:00:00.000Z"
      ],
      [
        "!Map",
        [
          [
            [
              "!BigInt",
              "1"
            ],
            [
              "!RegExp",
              [
                "a",
                "g"
              ]
            ]
          ]
        ]
      ]
    ]
  ],
  [
    "!",
    "!NaN",
    "collision"
  ]
]
```

</details>


<details><summary>@brillout/json-serializer</summary>

<!-- prettier-ignore -->
```json
[
  null,
  true,
  123,
  "string",
  [
    "array"
  ],
  {
    "k": "v"
  },
  "!undefined",
  "!Infinity",
  "!-Infinity",
  "!NaN",
  0,
  0,
  "!Date:2023-08-17T00:00:00.000Z",
  "!BigInt:1234",
  "!RegExp:/^\\d+/gms",
  "!Map:[\n  [\n    0,\n    \"!Date:1970-01-01T00:00:00.000Z\"\n  ],\n  [\n    \"!BigInt:1\",\n    \"!Set:[\\n  \\\"!RegExp:/a/g\\\"\\n]\"\n  ]\n]",
  "!Set:[\n  0,\n  \"!Date:1970-01-01T00:00:00.000Z\",\n  \"!Map:[\\n  [\\n    \\\"!BigInt:1\\\",\\n    \\\"!RegExp:/a/g\\\"\\n  ]\\n]\"\n]",
  [
    "!!NaN",
    "collision"
  ]
]
```

</details>


<details><summary>superjson</summary>

<!-- prettier-ignore -->
```json
{
  "json": [
    null,
    true,
    123,
    "string",
    [
      "array"
    ],
    {
      "k": "v"
    },
    null,
    "Infinity",
    "-Infinity",
    "NaN",
    0,
    "-0",
    "2023-08-17T00:00:00.000Z",
    "1234",
    "/^\\d+/gms",
    [
      [
        0,
        "1970-01-01T00:00:00.000Z"
      ],
      [
        "1",
        [
          "/a/g"
        ]
      ]
    ],
    [
      0,
      "1970-01-01T00:00:00.000Z",
      [
        [
          "1",
          "/a/g"
        ]
      ]
    ],
    [
      "!NaN",
      "collision"
    ]
  ],
  "meta": {
    "values": {
      "6": [
        "undefined"
      ],
      "7": [
        "number"
      ],
      "8": [
        "number"
      ],
      "9": [
        "number"
      ],
      "11": [
        "number"
      ],
      "12": [
        "Date"
      ],
      "13": [
        "bigint"
      ],
      "14": [
        "regexp"
      ],
      "15": [
        "map",
        {
          "0.1": [
            "Date"
          ],
          "1.0": [
            "bigint"
          ],
          "1.1": [
            "set",
            {
              "0": [
                "regexp"
              ]
            }
          ]
        }
      ],
      "16": [
        "set",
        {
          "1": [
            "Date"
          ],
          "2": [
            "map",
            {
              "0.0": [
                "bigint"
              ],
              "0.1": [
                "regexp"
              ]
            }
          ]
        }
      ]
    },
    "referentialEqualities": {
      "15.1.0": [
        "16.2.0.0"
      ]
    }
  }
}
```

</details>

<!-- %template-out-end:example% -->
