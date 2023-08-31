import child_process, {
  ChildProcess,
  type SpawnOptions,
} from "node:child_process";
import { groupBy, mapRegExp } from "@hiogawa/utils";

const MARKERS = {
  inputStart: "template-input-start",
  inputEnd: "template-input-end",
  outputStart: "template-output-start",
  outputEnd: "template-output-end",
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
    const chunks: { shell: boolean; value: string; command: string }[] = [];
    let found = false;
    mapRegExp(
      input,
      /{%shell (.*?)%}/g,
      (match) => {
        chunks.push({ shell: true, value: match[0], command: match[1] });
        found = true;
      },
      (nonMatch) => {
        chunks.push({ shell: false, value: nonMatch, command: "" });
      }
    );
    if (!found) {
      this.log(`* interpolation not found for '${id}'`);
    }
    let output = "";
    for (const chunk of chunks) {
      if (chunk.shell) {
        this.log(`* processing ${chunk.value}`);
        const child = child_process.spawn(chunk.command, {
          shell: true,
          stdio: ["ignore", "pipe", "pipe"],
          ...this.options?.spawn,
        });
        const { stdout, stderr } = await promisifyChildProcess(child);
        if (child.exitCode !== 0) {
          this.log(`** exitCode: ${child.exitCode}`);
        }
        if (stderr) {
          this.log(`** stderr **\n${stderr}`);
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

// simplified version of `ChildProcessPromise` from packages/utils-node/src/script.ts
function promisifyChildProcess(child: ChildProcess) {
  let stdout = "";
  let stderr = "";
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    child.stdout?.on("data", (v) => {
      stdout += v.toString();
    });
    child.stderr?.on("data", (v) => {
      stderr += v.toString();
    });
    child.on("close", () => {
      resolve({ stdout, stderr });
    });
    child.on("error", (err) => {
      reject(err);
    });
  });
}
