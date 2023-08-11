import { Err, Ok, type Result, formatError } from "@hiogawa/utils";
import type { TinyCli, TinyCliCommand } from "./cli";
import { TinyCliParseError } from "./utils";

export async function tinyCliMain(
  cli: TinyCli | TinyCliCommand<any>,
  opts?: {
    // assumes NodeJS.Process but avoid direct type dep
    process?: {
      argv: string[];
      exitCode?: number | undefined;
    };
    log?: (v: string) => void;
  }
): Promise<Result<unknown, unknown>> {
  // @ts-ignore silence type error on tsup
  const process = opts?.process ?? globalThis.process;
  const log = opts?.log ?? globalThis.console.error;
  try {
    const v = await cli.parse(process.argv.slice(2));
    return Ok(v);
  } catch (e) {
    log(formatError(e));
    if (e instanceof TinyCliParseError) {
      log("See '--help' for more info");
    }
    process.exitCode = 1;
    return Err(e);
  }
}
