import { Buffer } from "node:buffer";
import {
  type ChildProcess,
  type SpawnOptions,
  spawn,
} from "node:child_process";
import { zip } from "@hiogawa/utils";

// too simple but maybe useful enough version of
// https://github.com/google/zx
// https://github.com/sindresorhus/execa/blob/f4b8b3ab601c94d1503f1010822952758dcc6350/docs/scripts.md

type ScriptParam = string | number;

type HelperOptions = {
  noTrim?: boolean;
  verbose?: boolean;
  log?: (v: string) => void;
};

const defaultSpawnOptions: SpawnOptions = {
  shell: true,
  stdio: ["ignore", "pipe", "pipe"],
};

export const $ = /* @__PURE__ */ newScriptHelper();

export function newScriptHelper(options?: {
  spawn?: SpawnOptions;
  helper?: HelperOptions;
}) {
  const spawnOptions = { ...defaultSpawnOptions, ...options?.spawn };
  const helperOptions = options?.helper ?? {};
  const log = helperOptions.log ?? console.log;

  function $(strings: TemplateStringsArray, ...params: ScriptParam[]) {
    const command = [zip(strings, params), strings.at(-1)].flat(2).join("");
    if (helperOptions.verbose) {
      log(`$ ${command}`);
    }
    return new SpawnPromise(command, spawnOptions, helperOptions);
  }

  return $;
}

class SpawnPromise implements PromiseLike<string> {
  child: ChildProcess;
  promise: Promise<string>;
  stderr: string = "";
  stdout: string = "";

  constructor(
    private command: string,
    private options: SpawnOptions,
    private helperOptions: HelperOptions
  ) {
    const child = spawn(this.command, this.options);
    this.child = child;
    this.promise = new Promise<string>((resolve, reject) => {
      // TODO: support stdin?
      child.stdin;

      child.stdout?.on("data", (raw: unknown) => {
        processOutput(raw, (v) => (this.stdout += v), reject);
      });

      child.stderr?.on("data", (raw: unknown) => {
        processOutput(raw, (v) => (this.stdout += v), reject);
      });

      child.on("close", (code) => {
        if (code === 0) {
          let stdout = this.stdout;
          if (!this.helperOptions.noTrim) {
            stdout = stdout.trim();
          }
          resolve(stdout);
        } else {
          reject(new Error(`ChildProcess code ${code}`));
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });
  }

  // delegate promise api
  then: PromiseLike<string>["then"] = (...args) => this.promise.then(...args);
}

function processOutput(
  raw: unknown,
  onSuccess: (v: string) => void,
  onError: (v: unknown) => void
) {
  if (typeof raw === "string") {
    return onSuccess(raw);
  } else if (raw instanceof Buffer) {
    return onSuccess(raw.toString());
  }
  onError(new Error("unknown data", { cause: raw }));
}
