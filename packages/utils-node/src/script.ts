import {
  type ChildProcess,
  type SpawnOptions,
  spawn as childProcessSpawn,
} from "node:child_process";
import process from "node:process";
import { createManualPromise } from "@hiogawa/utils";

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

type NewOptions = SpawnOptions & { _?: Partial<HelperOptions> };

export function $new(options: NewOptions = {}) {
  // currently there's no special quoting or escaping so it's equivalent to normal string literal template.
  // for now, limit to `string | number` since that feels a reasonable usage.
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
  const api = Object.assign($, {
    ...options,
    _: { ...options._ },
    // new instance with additive options
    new: (options: NewOptions) =>
      $new({ ...api, ...options, _: { ...api._, ...options._ } }),
  });
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

    const manual = createManualPromise<string>();
    this.promise = manual.promise;

    child.stdout?.on("data", (raw) => {
      this.stdout += raw.toString();
    });

    child.stderr?.on("data", (raw) => {
      this.stderr += raw.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        let stdout = this.stdout;
        if (!this.helperOptions.noTrim) {
          stdout = stdout.trim();
        }
        manual.resolve(stdout);
      } else {
        manual.reject(
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
      manual.reject(err);
    });
  }

  // delegate promise api
  then: PromiseLike<string>["then"] = (...args) => this.promise.then(...args);
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
