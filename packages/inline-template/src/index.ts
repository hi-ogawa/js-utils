import child_process from "node:child_process";
import { mapRegExp } from "@hiogawa/utils";

interface TemplateOpitons {
  cwd: string;
}

export function processInlineTemplate(
  input: string,
  options: TemplateOpitons
): string {
  // collect templates
  //   %template-in-begin:ID%
  const ids = [...input.matchAll(/%template-in-begin:(\w+)%/g)].map(
    (m) => m[1]
  );

  // apply templates
  for (const id of ids) {
    input = processTemplateById(input, id, options);
  }

  return input;
}

function processTemplateById(
  input: string,
  id: string,
  options: TemplateOpitons
): string {
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
  const templateOut = processInterpolation(templateIn, options);
  const output = input.slice(0, outBegin) + templateOut + input.slice(outEnd);
  return output;
}

function processInterpolation(input: string, options: TemplateOpitons): string {
  const chunks: { match: boolean; value: string }[] = [];
  mapRegExp(
    input,
    /{%(.*?)%}/g,
    (match) => {
      chunks.push({ match: true, value: match[1] });
    },
    (nonMatch) => {
      chunks.push({ match: false, value: nonMatch });
    }
  );
  let output = "";
  for (const chunk of chunks) {
    if (chunk.match) {
      const spawnResult = child_process.spawnSync(chunk.value, {
        shell: true,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
        cwd: options.cwd,
      });
      if (spawnResult.stderr) {
        console.error("* [stderr]", chunk.value);
        console.error(spawnResult.stderr);
      }
      output += spawnResult.stdout.trim();
    } else {
      output += chunk.value;
    }
  }
  return output;
}

function getMatchOffset(input: string, re: RegExp, addMatchLength: boolean) {
  const m = input.match(re);
  if (typeof m?.index !== "number") {
    throw new Error(`Template pattern not found: '${re.source}'`);
  }
  return m.index + (addMatchLength ? m[0].length : 0);
}

function rawRe(strings: TemplateStringsArray, ...params: string[]) {
  let source = strings[0];
  params.forEach((param, i) => {
    source += param + strings[i + 1];
  });
  return new RegExp(source);
}
