import fs from "node:fs";
import { stringify as brilloutStringify } from "@brillout/json-serializer/stringify";
import superjson from "superjson";
import { createJsonExtra } from "../dist/reference.js";

/*
print example for README.md

usage:
  node ./packages/json-extra/misc/example.mjs input json-extra @brillout/json-serializer superjson
*/

// INPUT_START
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
// INPUT_END

const args = process.argv.slice(2);

if (args.includes("input")) {
  const data = fs.readFileSync(new URL(import.meta.url), "utf-8");
  const re = new RegExp(
    "// INPUT_START\nconst input = (.*);\n// INPUT_END",
    "s"
  );
  console.log(data.match(re)[1]);
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
