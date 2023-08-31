import child_process, { type SpawnOptions } from "node:child_process";
import { groupBy, mapRegExp } from "@hiogawa/utils";
import { ChildProcessPromise } from "@hiogawa/utils-node";

const MARKERS = {
  inputStart: "template-in-begin",
  inputEnd: "template-in-end",
  outputStart: "template-out-begin",
  outputEnd: "template-out-end",
};

export class InlineTemplateProcessor {
  constructor(
    private options?: {
      spawn?: SpawnOptions;
      log?: (...args: unknown[]) => void;
    }
  ) {}

  get log() {
    return this.options?.log ?? console.error;
  }

  async process(input: string) {
    // collect template markers
    const idMatches = input.matchAll(
      RegExp(`%${MARKERS.inputStart}:([a-zA-Z0-9_.-]+)%`, "g")
    );
    const ids = [...idMatches].map((m) => m[1]);

    // error if duplicates
    const duplicates = [...groupBy(ids, (id) => id)]
      .filter(([_k, vs]) => vs.length >= 2)
      .map(([k]) => k);
    if (duplicates.length > 0) {
      throw new Error(`Found duplicate ID: ${duplicates.join(", ")}`);
    }

    // process each id
    for (const id of ids) {
      input = await this.processById(input, id);
    }
    return input;
  }

  async processById(input: string, id: string) {
    const patterns = [
      RegExp(`.*%${MARKERS.inputStart}:${id}%.*`),
      RegExp(`.*%${MARKERS.inputEnd}:${id}%.*`),
      RegExp(`.*%${MARKERS.outputStart}:${id}%.*`),
      RegExp(`.*%${MARKERS.outputEnd}:${id}%.*`),
    ];
    const inBegin = getMatchOffset(input, patterns[0], true);
    const inEnd = getMatchOffset(input, patterns[1], false);
    const outBegin = getMatchOffset(input, patterns[2], true);
    const outEnd = getMatchOffset(input, patterns[3], false);
    const templateIn = input.slice(inBegin, inEnd);
    const templateOut = await this.processInterpolation(templateIn, id);
    const output = input.slice(0, outBegin) + templateOut + input.slice(outEnd);
    return output;
  }

  async processInterpolation(input: string, id: string) {
    const chunks: { match: boolean; value: string }[] = [];
    mapRegExp(
      input,
      /{% (.*?) %}/g,
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
        this.log(`[${id}:shell] ${chunk.value}`);
        const child = child_process.spawn(chunk.value, {
          shell: true,
          stdio: ["ignore", "pipe", "pipe"],
          ...this.options?.spawn,
        });
        const childPromise = new ChildProcessPromise(child);
        const stdout = await childPromise.stdoutPromise;
        if (child.exitCode !== 0) {
          this.log(`** exitCode: ${child.exitCode}`);
        }
        if (childPromise.stderr) {
          this.log(`** stderr\n${childPromise.stderr}`);
        }
        output += stdout.trim();
      } else {
        output += chunk.value;
      }
    }
    return output;
  }
}

function getMatchOffset(input: string, re: RegExp, addMatchLength: boolean) {
  const m = input.match(re);
  if (typeof m?.index !== "number") {
    throw new Error(`Template pattern not found: '${re.source}'`);
  }
  return m.index + (addMatchLength ? m[0].length : 0);
}
