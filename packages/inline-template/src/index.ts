import child_process from "node:child_process";
import { groupBy, mapRegExp } from "@hiogawa/utils";

interface TemplateOpitons {
  cwd?: string;
}

const MARKERS = {
  inputStart: "template-in-begin",
  inputEnd: "template-in-end",
  outputStart: "template-out-begin",
  outputEnd: "template-out-end",
};

export function processInlineTemplate(
  input: string,
  options: TemplateOpitons
): string {
  // collect template markers
  const idMatches = input.matchAll(
    RegExp(rawRe`%${MARKERS.inputStart}:(\w+)%`, "g")
  );
  const ids = [...idMatches].map((m) => m[1]);

  const duplicates = [...groupBy(ids, (id) => id)]
    .filter(([_k, vs]) => vs.length >= 2)
    .map(([k]) => k);
  if (duplicates.length > 0) {
    throw new Error(`Found duplicate ID: ${duplicates.join(", ")}`);
  }

  // process by id
  for (const id of ids) {
    input = processInlineTemplateById(input, id, options);
  }

  return input;
}

function processInlineTemplateById(
  input: string,
  id: string,
  options: TemplateOpitons
): string {
  const patterns = [
    rawRe`.*%${MARKERS.inputStart}:${id}%.*`,
    rawRe`.*%${MARKERS.inputEnd}:${id}%.*`,
    rawRe`.*%${MARKERS.outputStart}:${id}%.*`,
    rawRe`.*%${MARKERS.outputEnd}:${id}%.*`,
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
      // TODO: check status?
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
  let source = strings.raw[0];
  params.forEach((param, i) => {
    source += param + strings.raw[i + 1];
  });
  return new RegExp(source);
}
