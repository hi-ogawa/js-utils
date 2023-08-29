import fs from "node:fs";
import path from "node:path";
import { type ArgSchemaRecord, type TypedArgs, arg } from "@hiogawa/tiny-cli";
import { DefaultMap, LruCache, hashString, memoize } from "@hiogawa/utils";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { type ParseOutput, parseImportExport } from "./parser";

export const runnerArgs = {
  files: arg.stringArray("Typescript files to lint"),
  cache: arg.boolean("Enable caching"),
  cacheLocation: arg.string("Cache directory location", {
    default: `node_modules/.cache/${packageName}/v${packageVersion}`,
  }),
  ignore: arg.string("RegExp pattern to ignore export names", {
    optional: true,
  }),
  debug: arg.boolean("Debug output"),
} satisfies ArgSchemaRecord;

export async function runCommand(args: TypedArgs<typeof runnerArgs>) {
  const result = run(args.files, { cache: args.cache });

  const ignoreRegExp = args.ignore && new RegExp(args.ignore);
  const ignoreComment = "icheck-ignore";

  function isUsedExport(e: ExportUsage): boolean {
    return Boolean(
      e.used ||
        (ignoreRegExp && e.name.match(ignoreRegExp)) ||
        e.comment.includes(ignoreComment)
    );
  }

  const unused = [...result.exportUsages]
    .map(([k, vs]) => [k, vs.filter((v) => !isUsedExport(v))] as const)
    .filter(([_k, vs]) => vs.length > 0);

  return { result, unused };
}

interface ImportTarget {
  source: ImportSource;
  usage: ImportUsage;
}

type ImportSource = {
  type: "external" | "internal" | "unknown";
  name: string; // resolved file path if "internal"
};

type ImportUsage =
  | {
      // import { x as y } from "a"
      // export { x as y } from "a"
      type: "named";
      name: string; // x
    }
  | {
      // import * as a from "a"
      // export * from "a"
      type: "namespace";
    }
  | {
      // import "a"
      type: "sideEffect";
    };

export type ExportUsage = {
  name: string;
  used: boolean;
  position: [number, number];
  comment: string;
};

// 1. parse files
// 2. resolve import source
// 3. check unused exports
export function run(inputFiles: string[], options?: { cache?: boolean }) {
  const entries: { file: string; parseOutput: ParseOutput }[] = [];
  const errors: { file: string; error: unknown }[] = [];

  // normalize relative path (e.g. "./x.ts" => "x.ts")
  inputFiles = inputFiles.map((f) => path.normalize(f));

  const cachedParser = options?.cache ? createCachedParser() : undefined;
  let parse = cachedParser?.parse ?? parseImportExport;
  cachedParser?.load();

  //
  // extract import/export
  //

  for (const file of inputFiles) {
    const code = fs.readFileSync(file, "utf-8");
    const jsx = file.endsWith("x");
    const result = parse({ code, jsx });
    if (!result.ok) {
      errors.push({ file, error: result.value });
      continue;
    }
    entries.push({
      file,
      parseOutput: result.value,
    });
  }
  cachedParser?.save();

  //
  // resolve import module
  //

  // import graph as adjacency list
  const importRelations = new DefaultMap<string, ImportTarget[]>(() => []);

  for (const entry of entries) {
    for (const e of entry.parseOutput.imports) {
      const usages: ImportUsage[] = [];
      if (e.sideEffect) {
        usages.push({ type: "sideEffect" });
      }
      if (e.namespace) {
        usages.push({ type: "namespace" });
      }
      for (const el of e.bindings) {
        usages.push({ type: "named", name: el.nameBefore ?? el.name });
      }
      const source = resolveImportSource(entry.file, e.source);
      importRelations
        .get(entry.file)
        .push(...usages.map((usage) => ({ source, usage })));
    }
  }

  //
  // collect internal import usages
  //

  const importUsages = new DefaultMap<string, ImportUsage[]>(() => []);
  for (const target of [...importRelations.values()].flat()) {
    if (target.source.type === "internal") {
      importUsages.get(target.source.name).push(target.usage);
    }
  }

  function isUsedExport(file: string, name: string) {
    return (
      importUsages.has(file) &&
      importUsages
        .get(file)
        .some(
          (e) =>
            e.type === "namespace" || (e.type === "named" && e.name === name)
        )
    );
  }

  //
  // resolve export usages
  //
  const exportUsages = new DefaultMap<string, ExportUsage[]>(() => []);

  for (const entry of entries) {
    for (const e of entry.parseOutput.imports.filter((e) => e.reExport)) {
      // TODO: need to resolve re-export chain
      // e.namespace;

      for (const el of e.bindings) {
        exportUsages.get(entry.file).push({
          name: el.name,
          used: isUsedExport(entry.file, el.name),
          position: e.position,
          comment: e.comment,
        });
      }
    }

    for (const e of entry.parseOutput.exports) {
      for (const el of e.bindings) {
        exportUsages.get(entry.file).push({
          name: el.name,
          used: isUsedExport(entry.file, el.name),
          position: e.position,
          comment: e.comment,
        });
      }
    }
  }

  return {
    entries,
    errors,
    importRelations,
    importUsages,
    exportUsages,
  };
}

// cf.
// https://nodejs.org/api/esm.html#import-specifiers
// https://nodejs.org/api/modules.html#all-together
// https://www.typescriptlang.org/tsconfig#moduleResolution
export function resolveImportSource(
  containingFile: string,
  source: string
): ImportSource {
  // TODO: memoize fs check?

  //
  // poor-man's module path resolusion
  //

  // check ".", "./", "../" otherwise external
  // TODO: extra resolution for tsconfig (e.g. baseUrl, paths)
  if (!source.startsWith(".")) {
    return {
      type: "external",
      name: source,
    };
  }

  // normalize relative path
  let tmpSource = path.normalize(
    path.join(path.dirname(containingFile), source)
  );

  // "." => "./index"
  // "./dir" => "./dir/index"
  if (fs.statSync(tmpSource, { throwIfNoEntry: false })?.isDirectory()) {
    tmpSource = path.join(tmpSource, "index");
  }

  // "./file" => "./file.ts"
  if (!fs.existsSync(tmpSource)) {
    for (const ext of ["ts", "tsx", "js", "jsx"]) {
      const internalExt = tmpSource + "." + ext;
      if (fs.existsSync(internalExt)) {
        tmpSource = internalExt;
        break;
      }
    }
  }

  return fs.existsSync(tmpSource)
    ? {
        type: "internal",
        name: tmpSource,
      }
    : {
        type: "unknown",
        name: source,
      };
}

//
// cache (TODO: move this logic to cli.ts)
//

// configurable?
const CACHE_FILE = `node_modules/.cache/${packageName}/v${packageVersion}/parseImportExport`;
const CACHE_SIZE = 1000_000;

function createCachedParser() {
  const cache = new LruCache<string, any>(CACHE_SIZE);

  function load() {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      cache._map = new Map(data);
    }
  }

  function save() {
    const data = JSON.stringify([...cache._map.entries()]);
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, data);
  }

  const parse = memoize(parseImportExport, {
    keyFn: (arg) => hashString(JSON.stringify(arg)),
    cache,
  });

  return { parse, load, save };
}
