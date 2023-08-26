import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { version } from "../package.json";
import { run } from "./runner";

const command = new TinyCliCommand(
  {
    program: "icheck-ts",
    version,
    description: "Lint import and export usages",
    args: {
      files: arg.stringArray("Typescript files to lint"),
      ignore: arg.string("RegExp pattern to ignore export names", {
        optional: true,
      }),
      debug: arg.boolean("Debug output"),
    },
  },
  ({ args }) => {
    const result = run(args.files);

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

    const ignoreRe = args.ignore && new RegExp(args.ignore);
    const unused = [...result.exportUsages]
      .map(
        ([k, vs]) =>
          [
            k,
            vs.filter((v) => !v.used && !(ignoreRe && v.name.match(ignoreRe))),
          ] as const
      )
      .filter(([_k, vs]) => vs.length > 0);

    if (unused.length > 0) {
      console.log("* Unused exports");
      for (const [file, entries] of unused) {
        for (const e of entries) {
          console.log(`${file} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }
  }
);

tinyCliMain(command);
