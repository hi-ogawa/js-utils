import { Buffer } from "node:buffer";
import {
  type ChildProcess,
  type SpawnOptions,
  spawn,
} from "node:child_process";

// too simple but maybe useful enough version of
// https://github.com/google/zx
// https://github.com/sindresorhus/execa/blob/f4b8b3ab601c94d1503f1010822952758dcc6350/docs/scripts.md

// TODO: support array and unescaped wrapper?
type ScriptParam = string | number;

const defaultSpawnOptions: SpawnOptions = {
  shell: true,
  stdio: ["pipe", "pipe", "pipe"],
};

// TODO
// abstract command escape/parsing and spawn implementation?
// e.g. for https://github.com/moxystudio/node-cross-spawn
type HelperOptions = {
  noTrim?: boolean;
  verbose?: boolean;
  log?: (v: string) => void;
};

export const $ = /* @__PURE__ */ $new();

export function $new(options: SpawnOptions & { $?: HelperOptions } = {}) {
  const { $: helperOptions = {}, ...spawnOptions } = options;
  const log = helperOptions.log ?? console.error;

  return function $(strings: TemplateStringsArray, ...params: ScriptParam[]) {
    let command = strings[0];
    for (let i = 0; i < params.length; i++) {
      command += params[i] + strings[i + 1];
    }
    if (helperOptions.verbose) {
      log(`$ ${command}`);
    }
    return new SpawnPromise(
      command,
      { ...defaultSpawnOptions, ...spawnOptions },
      helperOptions
    );
  };
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
      child.stdout?.on("data", (raw: unknown) => {
        processOutput(raw, (v) => (this.stdout += v), reject);
      });

      child.stderr?.on("data", (raw: unknown) => {
        processOutput(raw, (v) => (this.stderr += v), reject);
      });

      child.on("close", (code) => {
        if (code === 0) {
          let stdout = this.stdout;
          if (!this.helperOptions.noTrim) {
            stdout = stdout.trim();
          }
          resolve(stdout);
        } else {
          reject(
            new Error(`ScriptError`, {
              cause: {
                command,
                code,
                stdout: this.stdout,
                stderr: this.stderr,
              },
            })
          );
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
