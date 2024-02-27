import fs from "node:fs";
import { stringify as brilloutStringify } from "@brillout/json-serializer/stringify";
import superjson from "superjson";
import { createJsonExtra } from "../dist/reference.js";
import { tinyassert } from "@hiogawa/utils";

/*
print example for README.md

usage:
  node ./packages/json-extra/misc/example.mjs input json-extra @brillout/json-serializer superjson
*/

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

const args = process.argv.slice(2);

if (args.includes("input")) {
  const selfString = fs.readFileSync(new URL(import.meta.url), "utf-8");
  const start = selfString.match(/^const input /m)?.index;
  const end = selfString.match(/^\];/m)?.index;
  tinyassert(typeof start === "number");
  tinyassert(typeof end === "number");
  const inputString = selfString.slice(start, end + 2);
  console.log(inputString);
}

if (args.includes("json-extra")) {
  const jsonExtra = createJsonExtra({ builtins: true });
  const stringfied = jsonExtra.stringify(input, null, 2);
  console.log(stringfied);
}

if (args.includes("@brillout/json-serializer")) {
  const stringfied = brilloutStringify(input, { space: 2 });
  console.log(stringfied);
}

if (args.includes("superjson")) {
  const stringfied = JSON.stringify(superjson.serialize(input), null, 2);
  console.log(stringfied);
}
