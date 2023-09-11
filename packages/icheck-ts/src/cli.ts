import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { uniqBy } from "@hiogawa/utils";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { parseImportExport } from "./parser";
import {
  type ExportUsage,
  findCircularImport,
  formatCircularImportError,
  runner,
} from "./runner";
import { memoizeOnFile } from "./utils";

const command = new TinyCliCommand(
  {
    program: "icheck-ts",
    version: packageVersion,
    description: "Report unused exports",
    args: {
      files: arg.stringArray("Files to check exports"),
      cache: arg.boolean("Enable caching"),
      cacheLocation: arg.string("Cache directory location", {
        default: `node_modules/.cache/${packageName}/v${packageVersion}`,
      }),
      cacheSize: arg.number("LRU cache size", { default: 100_000 }),
      ignore: arg.string("RegExp pattern to ignore export names", {
        optional: true,
      }),
    },
  },
  async ({ args }) => {
    const [parse, cacheOp] = memoizeOnFile(parseImportExport, {
      disabled: !args.cache,
      maxSize: args.cacheSize,
      file: args.cacheLocation,
    });
    await cacheOp?.load();
    const result = await runner(args.files, { parse });
    await cacheOp?.save();

    // apply extra unused rules
    const ignoreRegExp = args.ignore && new RegExp(args.ignore);
    const ignoreComment = "icheck-ignore";

    function isUsedExport(e: ExportUsage): boolean {
      return Boolean(
        e.used ||
          (ignoreRegExp && e.name.match(ignoreRegExp)) ||
          e.node.comment.includes(ignoreComment)
      );
    }

    const unusedExports = [...result.exportUsages]
      .map(([k, vs]) => [k, vs.filter((v) => !isUsedExport(v))] as const)
      .filter(([_k, vs]) => vs.length > 0);

    // parse error
    if (result.errors.size > 0) {
      console.log("** Parse errors **");
      for (const [file, error] of result.errors) {
        console.log(file, error);
      }
      process.exitCode = 1;
    }

    // unused exports error
    if (unusedExports.length > 0) {
      console.log("** Unused exports **");
      for (const [file, entries] of unusedExports) {
        for (const e of entries) {
          console.log(`${file}:${e.node.position[0]} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }

    // circular import
    const circularResult = findCircularImport(result.importRelations);
    if (circularResult.backEdges.length > 0) {
      console.log("** Circular imports **");
      // TODO: group/sort by [edge[0], edge[1].source.name]
      const uniqBackEdges = uniqBy(circularResult.backEdges, (edge) =>
        JSON.stringify([edge[0], edge[1].source.name])
      );
      for (const edge of uniqBackEdges) {
        const formatted = formatCircularImportError(
          edge,
          circularResult.parentMap
        );
        formatted.lines.forEach((line, i) => {
          const prefix = i > 0 ? "    ".repeat(i - 1) + " -> " : "";
          console.log(prefix + line);
        });
      }
      process.exitCode = 1;
    }
  }
);

tinyCliMain(command);
