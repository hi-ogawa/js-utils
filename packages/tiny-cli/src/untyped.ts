import { range, splitFirst } from "@hiogawa/utils";

//
// un-typed raw argument parsing
//

export interface UntypedArgs {
  positionals: string[];
  keyValues: [string, string][];
  flags: string[];
}

export function parseUntyped(
  rawArgs: string[],
  config?: { flags: string[] }
): UntypedArgs {
  const result: UntypedArgs = {
    positionals: [],
    keyValues: [],
    flags: [],
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    // handle flag "--key"
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);

      // handle "config.flags"
      if (config?.flags.includes(flag)) {
        result.flags.push(flag);
        continue;
      }

      // handle "--key=value"
      if (flag.includes("=")) {
        const [key, value] = splitFirst(flag, "=");
        result.keyValues.push([key, value]);
        continue;
      }

      // handle "--key value"
      const nextArg = rawArgs.at(i + 1);
      if (typeof nextArg === "string" && !nextArg.startsWith("--")) {
        result.keyValues.push([flag, nextArg]);
        i++;
        continue;
      }

      // otherwise "key only"
      result.flags.push(flag);
      continue;
    }

    // otherwise positional
    result.positionals.push(arg);
  }

  return result;
}

// minimal simpler version just for comparison.
// it supports key/value option only by "--key=value" form
// which is somewhat similar to esbuild's cli
// https://github.com/evanw/esbuild/blob/0b48edaac1b92da4d14d300252304c44821dd2f2/pkg/cli/cli_impl.go
export function parseUntypedSimple(args: string[]): UntypedArgs {
  const result: UntypedArgs = {
    positionals: [],
    keyValues: [],
    flags: [],
  };

  for (const i of range(args.length)) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);
      if (flag.includes("=")) {
        const [key, value] = splitFirst(flag, "=");
        result.keyValues.push([key, value]);
      } else {
        result.flags.push(flag);
      }
    } else {
      result.positionals.push(arg);
    }
  }

  return result;
}
