# json-extra

Simple alternative for
[`@brillout/json-serializer`](https://github.com/brillout/json-serializer/),
[`superjson`](https://github.com/blitz-js/superjson), etc...

The basic idea is based on [`@brillout/json-serializer`](https://github.com/brillout/json-serializer/)
but it employs an array-based encoding for special values,
which makes it easy to support custom types
and also provides human-readibility for custom containers.

<!--

-------------------------------------
---- %template-input-start:example% ----

## example1

See `./misc/example.mjs`

```js
{%shell node ./misc/example.mjs input %}
```

<details><summary>@hiogawa/json-extra</summary>

```json
{%shell node ./misc/example.mjs json-extra %}
```

</details>

<details><summary>@brillout/json-serializer</summary>

```json
{%shell node ./misc/example.mjs @brillout/json-serializer %}
```

</details>

<details><summary>superjson</summary>

```json
{%shell node ./misc/example.mjs superjson %}
```

</details>

## example2: cyclic reference

See `./misc/reference.mjs`

```js
const parent = { children: new Map() };
const child1 = { parent };
const child2 = { parent, siblings: new Set([child1]) };
parent.children.set("foo", child1);
parent.children.set("bar", child2);
```

<details><summary>console.log</summary>

```js
{%shell node ./misc/reference.mjs input %}
```

</details>

<details><summary>@hiogawa/json-extra</summary>

```json
{%shell node ./misc/reference.mjs json-extra %}
```

</details>

<details><summary>devalue</summary>

```json
{%shell node ./misc/reference.mjs devalue %}
```

</details>

---- %template-input-end:example% ----
-----------------------------------

-->

<!-- %template-output-start:example% -->

## example1

See `./misc/example.mjs`

```js
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
  new Map([
    [0, new Date(0)],
    [1n, new Set([/a/g])],
  ]),
  new Set([0, new Date(0), new Map([[1n, /a/g]])]),

  // escape encoding collision
  ["!NaN", "collision"],
];
```

<details><summary>@hiogawa/json-extra</summary>

```json
[
  null,
  true,
  123,
  "string",
  ["array"],
  {
    "k": "v"
  },
  ["!undefined", 0],
  ["!Infinity", 0],
  ["!-Infinity", 0],
  ["!NaN", 0],
  0,
  ["!-0", 0],
  ["!Date", "2023-08-17T00:00:00.000Z"],
  ["!BigInt", "1234"],
  ["!RegExp", ["^\\d+", "gms"]],
  [
    "!Map",
    [
      [0, ["!Date", "1970-01-01T00:00:00.000Z"]],
      [
        ["!BigInt", "1"],
        ["!Set", [["!RegExp", ["a", "g"]]]]
      ]
    ]
  ],
  [
    "!Set",
    [
      0,
      ["!Date", "1970-01-01T00:00:00.000Z"],
      [
        "!Map",
        [
          [
            ["!BigInt", "1"],
            ["!RegExp", ["a", "g"]]
          ]
        ]
      ]
    ]
  ],
  ["!", "!NaN", "collision"]
]
```

</details>

<details><summary>@brillout/json-serializer</summary>

```json
[
  null,
  true,
  123,
  "string",
  ["array"],
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
  ["!!NaN", "collision"]
]
```

</details>

<details><summary>superjson</summary>

```json
{
  "json": [
    null,
    true,
    123,
    "string",
    ["array"],
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
      [0, "1970-01-01T00:00:00.000Z"],
      ["1", ["/a/g"]]
    ],
    [0, "1970-01-01T00:00:00.000Z", [["1", "/a/g"]]],
    ["!NaN", "collision"]
  ],
  "meta": {
    "values": {
      "6": ["undefined"],
      "7": ["number"],
      "8": ["number"],
      "9": ["number"],
      "11": ["number"],
      "12": ["Date"],
      "13": ["bigint"],
      "14": ["regexp"],
      "15": [
        "map",
        {
          "0.1": ["Date"],
          "1.0": ["bigint"],
          "1.1": [
            "set",
            {
              "0": ["regexp"]
            }
          ]
        }
      ],
      "16": [
        "set",
        {
          "1": ["Date"],
          "2": [
            "map",
            {
              "0.0": ["bigint"],
              "0.1": ["regexp"]
            }
          ]
        }
      ]
    },
    "referentialEqualities": {
      "15.1.0": ["16.2.0.0"]
    }
  }
}
```

</details>

## example2: cyclic reference

See `./misc/reference.mjs`

```js
const parent = { children: new Map() };
const child1 = { parent };
const child2 = { parent, siblings: new Set([child1]) };
parent.children.set("foo", child1);
parent.children.set("bar", child2);
```

<details><summary>console.log</summary>

```js
<ref *1> {
  children: Map(2) {
    'foo' => { parent: [Circular *1] },
    'bar' => { parent: [Circular *1], siblings: [Set] }
  }
}
```

</details>

<details><summary>@hiogawa/json-extra</summary>

```json
{
  "children": [
    "!Map",
    [
      [
        "foo",
        {
          "parent": ["!", 0]
        }
      ],
      [
        "bar",
        {
          "parent": ["!", 0],
          "siblings": ["!Set", [["!", 3]]]
        }
      ]
    ]
  ]
}
```

</details>

<details><summary>devalue</summary>

```json
[
  {
    "children": 1
  },
  ["Map", 2, 3, 4, 5],
  "foo",
  {
    "parent": 0
  },
  "bar",
  {
    "parent": 0,
    "siblings": 6
  },
  ["Set", 3]
]
```

</details>

<!-- %template-output-end:example% -->
