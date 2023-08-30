import process from "node:process";
import fs from "node:fs";
import child_process from "node:child_process";
import { mapRegExp } from "@hiogawa/utils";

// usage:
//   npx tsx misc/inline-template.mts packages/icheck-ts/README.md
//   node misc/inline-template.mjs packages/icheck-ts/README.md

/*

Based on four `%template-...:ID%` markers, (OUTPUT) will be replaced by (INPUT) with special {% ... %} interpolation applied.

---

... %template-in-begin:ID% ...

...(INPUT with {% ... %})...

... %template-in-end:ID% ...

... %template-out-begin:ID% ...

...(OUTPUT)...

... %template-out-end:ID% ...

*/

function main() {
  const [infile] = process.argv.slice(2);
  let input = fs.readFileSync(infile, "utf-8");

  // collect templates
  const ids = [...input.matchAll(/%template-in-begin:(\w+)%/g)].map(
    (m) => m[1]
  );

  for (const id of ids) {
    input = applyTemplate(input, id);
  }

  console.log(input);
}

function applyTemplate(input: string, id: string): string {
  const patterns = [
    rawRe`.*%template-in-begin:${id}%.*`,
    rawRe`.*%template-in-end:${id}%.*`,
    rawRe`.*%template-out-begin:${id}%.*`,
    rawRe`.*%template-out-end:${id}%.*`,
  ];
  const inBegin = getMatchOffset(input, patterns[0], true);
  const inEnd = getMatchOffset(input, patterns[1], false);
  const outBegin = getMatchOffset(input, patterns[2], true);
  const outEnd = getMatchOffset(input, patterns[3], false);
  const templateIn = input.slice(inBegin, inEnd);
  const templateOut = applyInterpolation(templateIn);
  const output = input.slice(0, outBegin) + templateOut + input.slice(outEnd);
  return output;
}

function applyInterpolation(input: string): string {
  let output = "";
  mapRegExp(
    input,
    /{%(.*?)%}/g,
    (match) => {
      const command = match[1];
      const stdout = child_process.execSync(command, { encoding: "utf-8" });
      output += stdout.trim();
    },
    (nonMatch) => {
      output += nonMatch;
    }
  );
  return output;
}

function getMatchOffset(input: string, re: RegExp, addMatchLength: boolean) {
  const m = input.match(re);
  if (typeof m?.index !== "number") {
    throw new Error("Patten not found: " + re.source);
  }
  return m.index + (addMatchLength ? m[0].length : 0);
}

function rawRe(strings: TemplateStringsArray, ...params: string[]) {
  let source = strings[0];
  params.forEach((p, i) => {
    source += params[i] + strings[i + 1];
  });
  return new RegExp(source);
}

main();
