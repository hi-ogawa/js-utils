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
    return new SpawnPromiseLike(command, spawnOptions, helperOptions);
  }

  // expose options in a self-referential way
  const api = Object.assign($, { _: {}, ...options });
  return api;
}

class SpawnPromiseLike implements PromiseLike<string> {
  child: ChildProcess;
  promise: Promise<string>;
  stderr: string = "";
  stdout: string = "";

  constructor(
    private command: string,
    private options: SpawnOptions,
    private helperOptions: HelperOptions
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
  // cf. https://github.com/sindresorhus/execa/blob/f4b8b3ab601c94d1503f1010822952758dcc6350/lib/verbose.js#L10
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ms = d.getMilliseconds();
  function pad(n: number, max: number) {
    return String(n).padStart(max, "0");
  }
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
}
