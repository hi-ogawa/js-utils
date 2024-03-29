import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { colors, groupBy, sortBy, uniqBy } from "@hiogawa/utils";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { parseImportExport } from "./parser";
import {
  type ExportUsage,
  type ImportTarget,
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
      ignoreUnresolved: arg.string(
        "RegExp pattern to ignore unresolved import",
        {
          optional: true,
        }
      ),
      noCheckCircular: arg.boolean("Disable checking circular import"),
      noCheckUnresolved: arg.boolean("Disable checking unresolved import"),
      useImportMetaResolve: arg.boolean(
        "Use import.meta.resolve for module resolution"
      ),
    },
  },
  async ({ args }) => {
    const [parse, cacheOp] = memoizeOnFile(parseImportExport, {
      disabled: !args.cache,
      maxSize: args.cacheSize,
      file: args.cacheLocation,
    });
    await cacheOp?.load();
    const result = await runner(args.files, {
      parse,
      useImportMetaResolve: args.useImportMetaResolve,
    });
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

    // unused exports error
    const unusedExports = [...result.exportUsages]
      .map(([k, vs]) => [k, vs.filter((v) => !isUsedExport(v))] as const)
      .filter(([_k, vs]) => vs.length > 0);

    // parse error
    if (result.errors.size > 0) {
      console.log(colors.red("** Parse errors **"));
      for (const [file, error] of result.errors) {
        console.log(file, error);
      }
      process.exitCode = 1;
    }

    // unresolved imports
    const ignoreUnresolvedRegExp =
      args.ignoreUnresolved && new RegExp(args.ignoreUnresolved);

    let unresolvedImports = [...result.importRelations]
      .map(
        ([file, targets]) =>
          [file, targets.filter((e) => isUnresolveImport(e))] as const
      )
      .filter(([_file, targets]) => targets.length > 0);

    function isUnresolveImport(e: ImportTarget) {
      return (
        e.source.type === "unknown" &&
        !(ignoreUnresolvedRegExp && e.source.name.match(ignoreUnresolvedRegExp))
      );
    }

    if (!args.noCheckUnresolved && unresolvedImports.length > 0) {
      console.log(colors.red("** Unresolved imports **"));
      for (const [file, targets] of unresolvedImports) {
        for (const e of uniqBy(targets, (target) => target.source)) {
          console.log(`${file}:${e.node.position[0]} - ${e.source.name}`);
        }
      }
      process.exitCode = 1;
    }

    if (unusedExports.length > 0) {
      console.log(colors.red("** Unused exports **"));
      for (const [file, entries] of unusedExports) {
        for (const e of entries) {
          console.log(`${file}:${e.node.position[0]} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }

    // circular import
    if (!args.noCheckCircular) {
      const circularResult = findCircularImport(result.importRelations);
      if (circularResult.backEdges.length > 0) {
        console.log(colors.red("** Circular imports **"));
        // group/sort by initial cyclic edge
        const edgeWithKeys = circularResult.backEdges.map((e) => ({
          edge: e,
          key: JSON.stringify([e[0], e[1].source.name]),
        }));
        const groups = groupBy(
          sortBy(edgeWithKeys, (e) => e.key),
          (e) => e.key
        );
        const uniqEdges = [...groups.values()].map((group) => group[0].edge);
        for (const edge of uniqEdges) {
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
  }
);

colors._enable(process.stdout.isTTY);
tinyCliMain(command);
