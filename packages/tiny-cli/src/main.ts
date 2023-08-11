import { Err, Ok, type Result, formatError } from "@hiogawa/utils";
import type { TinyCli, TinyCliCommand } from "./cli";
import { TinyCliParseError } from "./utils";

export async function tinyCliMain(
  cli: TinyCli | TinyCliCommand<any>,
  opts?: {
    process?: Pick<(typeof globalThis)["process"], "argv" | "exitCode">;
    log?: (v: string) => void;
  }
): Promise<Result<unknown, unknown>> {
  const process = opts?.process ?? globalThis.process;
  const log = opts?.log ?? globalThis.console.log;
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
