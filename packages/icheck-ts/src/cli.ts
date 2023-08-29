import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { type ExportUsage, run } from "./runner";

const command = new TinyCliCommand(
  {
    program: "icheck-ts",
    version: packageVersion,
    description: "Lint import and export usages",
    args: {
      files: arg.stringArray("Typescript files to lint"),
      cache: arg.boolean("Enable caching"),
      cacheLocation: arg.string("Cache directory location", {
        default: `node_modules/.cache/${packageName}/v${packageVersion}`,
      }),
      ignore: arg.string("RegExp pattern to ignore export names", {
        optional: true,
      }),
    },
  },
  async ({ args }) => {
    const result = run(args.files, { cache: args.cache });

    // apply extra unused rules
    const ignoreRegExp = args.ignore && new RegExp(args.ignore);
    const ignoreComment = "icheck-ignore";

    function isUsedExport(e: ExportUsage): boolean {
      return Boolean(
        e.used ||
          (ignoreRegExp && e.name.match(ignoreRegExp)) ||
          e.comment.includes(ignoreComment)
      );
    }

    const unusedExports = [...result.exportUsages]
      .map(([k, vs]) => [k, vs.filter((v) => !isUsedExport(v))] as const)
      .filter(([_k, vs]) => vs.length > 0);

    // parse error
    if (result.errors.length > 0) {
      console.log("** Parse errors **");
      for (const { file, error } of result.errors) {
        console.log(file, error);
      }
      process.exitCode = 1;
    }

    // unused exports error
    if (unusedExports.length > 0) {
      console.log("** Unused exports **");
      for (const [file, entries] of unusedExports) {
        for (const e of entries) {
          console.log(`${file}:${e.position[0]} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }
  }
);

//
// main
//

tinyCliMain(command);
