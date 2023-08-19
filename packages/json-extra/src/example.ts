import { stringify as brilloutStringify } from "@brillout/json-serializer/stringify";
import superjson from "superjson";
import { createJsonExtra } from ".";

// output example for README.md
// npx tsx ./packages/json-extra/src/example.ts

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

console.log(`\n<details><summary>@hiogawa/json-extra</summary>\n`);
console.log("```json");
console.log(jsonExtra.stringify(original, null, 2));
console.log("```");
console.log(`\n</details>\n`);

console.log(`\n<details><summary>@brillout/json-serializer</summary>\n`);
console.log("```json");
console.log(brilloutStringify(original, { space: 2 }));
console.log("```");
console.log(`\n</details>\n`);

console.log(`\n<details><summary>superjson</summary>\n`);
console.log("```json");
console.log(JSON.stringify(superjson.serialize(original), null, 2));
console.log("```");
console.log(`\n</details>\n`);
