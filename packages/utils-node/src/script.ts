import { Buffer } from "node:buffer";
import {
  type ChildProcess,
  type SpawnOptions,
  spawn as childProcessSpawn,
} from "node:child_process";
import process from "node:process";

// too simple but maybe useful enough version of
// https://github.com/google/zx
// https://github.com/sindresorhus/execa/blob/f4b8b3ab601c94d1503f1010822952758dcc6350/docs/scripts.md

type HelperOptions = {
  noTrim: boolean;
  verbose: boolean;
  log: (v: string) => void;
  // maybe used to override with https://github.com/moxystudio/node-cross-spawn
  spawn: typeof childProcessSpawn;
};

export const $ = /* @__PURE__ */ $new();

export function $new(
  options: SpawnOptions & { _?: Partial<HelperOptions> } = {}
) {
  // currently there's no special quoting or escaping so it's equivalent to normal string literal template.
  // for now, limit to `string | number` since that's the same usage.
  function $(strings: TemplateStringsArray, ...params: (string | number)[]) {
    // process options
    const spawnOptions: SpawnOptions = {
      shell: process.env["SHELL"] || true,
      stdio: ["pipe", "pipe", "pipe"],
      ...api,
    };
    const helperOptions: HelperOptions = {
      noTrim: false,
      verbose: false,
      log: console.error,
      spawn: childProcessSpawn,
      ...api._,
    };

    // format command
    let command = strings[0];
    params.forEach((param, i) => {
      command += param + strings[i + 1];
    });

    // verbose
    if (helperOptions.verbose) {
      helperOptions.log(`[${formatNow()}] ${command}`);
    }

    // spawn
    return new SpawnPromise(command, spawnOptions, helperOptions);
  }

  // expose options in a self-referential way
  const api = Object.assign($, { _: {}, ...options });
  return api;
}

// TODO: refactor with ChildProcessPromise?
class SpawnPromise implements PromiseLike<string> {
  child: ChildProcess;
  promise: Promise<string>;
  stderr: string = "";
  stdout: string = "";

  constructor(
    private command: string,
    private options: SpawnOptions,
    private helperOptions: Pick<HelperOptions, "noTrim" | "spawn">
  ) {
    const child = helperOptions.spawn(this.command, this.options);
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

// simple async ChildProcess wrapper
export class ChildProcessPromise {
  stdoutPromise: Promise<string>;
  stderr: string = "";
  stdout: string = "";

  constructor(public child: ChildProcess) {
    this.stdoutPromise = new Promise<string>((resolve, reject) => {
      child.stdout?.on("data", (raw: unknown) => {
        processOutput(raw, (v) => (this.stdout += v), reject);
      });

      child.stderr?.on("data", (raw: unknown) => {
        processOutput(raw, (v) => (this.stderr += v), reject);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(this.stdout);
        } else {
          reject(
            new Error(`ChildProcessPromiseError`, {
              cause: {
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

function formatNow() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
  }).format(new Date());
}
