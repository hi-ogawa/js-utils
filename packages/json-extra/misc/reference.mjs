/*
usage:
  node ./packages/json-extra/misc/reference.mjs input console json-extra devalue
*/

// INPUT_START
const parent = { children: new Map() };
const child1 = { parent };
const child2 = { parent, siblings: new Set([child1]) };
parent.children.set("foo", child1);
parent.children.set("bar", child2);
// INPUT_END

const args = process.argv.slice(2);
const input = parent;

if (args.includes("input")) {
  const fs = await import("node:fs");
  const data = fs.readFileSync(new URL(import.meta.url), "utf-8");
  const re = new RegExp("// INPUT_START\n(.*)\n// INPUT_END", "s");
  console.log(data.match(re)[1]);
}

if (args.includes("console")) {
  console.log(input);
}

if (args.includes("json-extra")) {
  const { createJsonExtra } = await import("../dist/reference.js");
  const jsonExtra = createJsonExtra({ builtins: true });
  const stringfied = jsonExtra.stringify(input, null, 2);
  console.log(stringfied);
}

if (args.includes("devalue")) {
  // https://github.com/Rich-Harris/devalue
  const devalue = await import("devalue");
  const stringified = devalue.stringify(input);
  console.log(JSON.stringify(JSON.parse(stringified), null, 2));
}
