import { stringify as brilloutStringify } from "@brillout/json-serializer/stringify";
import superjson from "superjson";
import { createJsonExtra } from ".";

const jsonExtra = createJsonExtra({ builtins: true });

// print example output for README.md
//
// usage:
//   npx tsx ./packages/json-extra/src/example.ts

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

console.log(`
<details><summary>@hiogawa/json-extra</summary>

<!-- prettier-ignore -->
${"```"}json
${jsonExtra.stringify(original, null, 2)}
${"```"}

</details>

<details><summary>@brillout/json-serializer</summary>

<!-- prettier-ignore -->
${"```"}json
${brilloutStringify(original, { space: 2 })}
${"```"}

</details>

<details><summary>superjson</summary>

<!-- prettier-ignore -->
${"```"}json
${JSON.stringify(superjson.serialize(original), null, 2)}
${"```"}

</details>
`);
