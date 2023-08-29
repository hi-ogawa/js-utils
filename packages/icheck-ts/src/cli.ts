import process from "node:process";
import { TinyCliCommand, tinyCliMain } from "@hiogawa/tiny-cli";
import { version as packageVersion } from "../package.json";
import { runCommand, runnerArgs } from "./runner";

const command = new TinyCliCommand(
  {
    program: "icheck-ts",
    version: packageVersion,
    description: "Lint import and export usages",
    args: runnerArgs,
  },
  async ({ args }) => {
    const { result, unused } = await runCommand(args);

    if (args.debug) {
      console.log(new Map(result.exportUsages));
    }

    if (result.errors.length > 0) {
      console.log("* Parse errors");
      for (const { file, error } of result.errors) {
        console.log(file, error);
      }
      process.exitCode = 1;
    }

    if (unused.length > 0) {
      console.log("* Unused exports");
      for (const [file, entries] of unused) {
        for (const e of entries) {
          console.log(`${file}:${e.position[0]} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }
  }
);

tinyCliMain(command);
