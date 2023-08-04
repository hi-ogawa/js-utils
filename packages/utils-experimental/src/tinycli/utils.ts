import { range, splitFirst } from "@hiogawa/utils";

//
// un-typed raw argument parsing
//

export interface ParsedArgs {
  positionals: string[];
  keyValues: [string, unknown][];
  flags: string[];
}

export function parseArgs(
  args: string[],
  config?: { flags: string[] }
): ParsedArgs {
  const parsed: ParsedArgs = {
    positionals: [],
    keyValues: [],
    flags: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // handle flag "--key"
    if (arg.startsWith("--")) {
      const flag = arg.slice(2);

      // handle "--key=value"
      if (flag.includes("=")) {
        const [key, value] = splitFirst(flag, "=");
        parsed.keyValues.push([key, value]);
        continue;
      }

      // if given as "config.keyOnly" then don't lookup next
      if (config?.flags.includes(flag)) {
        parsed.flags.push(flag);
        continue;
      }

      // handle "--key value"
      const nextArg = args.at(i + 1);
      if (typeof nextArg === "string" && !nextArg.startsWith("--")) {
        parsed.keyValues.push([flag, nextArg]);
        i++;
        continue;
      }

      // otherwise "key only"
      parsed.flags.push(flag);
      continue;
    }

    // otherwise positional
    parsed.positionals.push(arg);
  }

  return parsed;
}

// minimal simpler version just for comparison.
// it supports key/value option only by "--key=value" form
// which is somewhat similar to esbuild's cli
// https://github.com/evanw/esbuild/blob/0b48edaac1b92da4d14d300252304c44821dd2f2/pkg/cli/cli_impl.go
export function simpleParseArgs(args: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
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
        parsed.keyValues.push([key, value]);
      } else {
        parsed.flags.push(flag);
      }
    } else {
      parsed.positionals.push(arg);
    }
  }

  return parsed;
}
