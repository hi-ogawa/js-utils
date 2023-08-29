import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { TinyCliCommand, arg, tinyCliMain } from "@hiogawa/tiny-cli";
import { LruCache, hashString, memoize } from "@hiogawa/utils";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { parseImportExport } from "./parser";
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
      cacheSize: arg.number("LRU cache size", { default: 1000_000 }),
      ignore: arg.string("RegExp pattern to ignore export names", {
        optional: true,
      }),
    },
  },
  async ({ args }) => {
    const [parse, cache] = memoizeOnFile(parseImportExport, {
      disabled: !args.cache,
      maxSize: args.cacheSize,
      file: args.cacheLocation,
    });
    cache.load();
    const result = run(args.files, { parse });
    cache.save();

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
          console.log(`${file}:${e.position[0]} - ${e.name}`);
        }
      }
      process.exitCode = 1;
    }
  }
);

//
// cache
//

// TOOD: to utils?
export function memoizeOnFile<F extends (...args: any[]) => any>(
  f: F,
  options: { disabled?: boolean; file: string; maxSize: number }
) {
  if (options.disabled) {
    return [f, { load: () => {}, save: () => {} }] as const;
  }

  const cache = new LruCache<string, any>(options.maxSize);

  function load() {
    if (fs.existsSync(options.file)) {
      const data = JSON.parse(fs.readFileSync(options.file, "utf-8"));
      cache._map = new Map(data);
    }
  }

  function save() {
    const data = JSON.stringify([...cache._map.entries()]);
    fs.mkdirSync(path.dirname(options.file), { recursive: true });
    fs.writeFileSync(options.file, data);
  }

  const memoized = memoize(f, {
    keyFn: (...arg) => hashString(JSON.stringify(arg)),
    cache,
  });

  return [memoized, { load, save }] as const;
}

//
// main
//

tinyCliMain(command);
