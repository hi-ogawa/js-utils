import fs from "node:fs";
import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { memoize } from "@hiogawa/utils";
import { version as packageVersion } from "../package.json";
import { run } from "./runner";

const command = new TinyCliCommand(
  {
    program: "icheck-ts",
    version: packageVersion,
    description: "Lint import and export usages",
    args: {
      files: arg.stringArray("Typescript files to lint"),
      cache: arg.boolean("enable caching"),
      ignore: arg.string("RegExp pattern to ignore export names", {
        optional: true,
      }),
      debug: arg.boolean("Debug output"),
    },
  },
  ({ args }) => {
    const result = run(args.files, { cache: args.cache });

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
          const line = resolveFilePosition(file)(e.position)[0];
          console.log(`${file}:${line} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }
  }
);

// TODO: shouldn't read files again. just resolve during `parseImportExport` already?
const resolveFilePosition = memoize((file: string) => {
  const code = fs.readFileSync(file, "utf-8");
  return (position: number) => {
    const slice = code.slice(0, position);
    const lines = slice.split("\n");
    return [lines.length, lines.at(-1)!.length];
  };
});

tinyCliMain(command);
