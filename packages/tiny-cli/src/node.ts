import process from "node:process";
import { Err, Ok, type Result, formatError } from "@hiogawa/utils";
import type { TinyCli, TinyCliCommand } from "./cli";
import { TinyCliParseError } from "./utils";

export async function tinyCliMain(
  cli: TinyCli | TinyCliCommand<any>
): Promise<Result<unknown, unknown>> {
  try {
    const v = await cli.parse(process.argv.slice(2));
    return Ok(v);
  } catch (e) {
    console.error(formatError(e));
    if (e instanceof TinyCliParseError) {
      console.log("See '--help' for more info");
    }
    process.exitCode = 1;
    return Err(e);
  }
}
