import fs from "node:fs";
import path from "node:path";
import { DefaultMap, LruCache, hashString, memoize } from "@hiogawa/utils";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { type ParseOutput, parseImportExport } from "./parser";

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
  // normalize relative path to match with `resolveImportSource` (e.g. "./x.ts" => "x.ts")
  inputFiles = inputFiles.map((f) => path.normalize(f));

  //
  // extract import/export
  //
  const parsedFiles = new Map<string, ParseOutput>();
  const errors = new Map<string, unknown>();

  const cachedParser = options?.cache ? createCachedParser() : undefined;
  let parse = cachedParser?.parse ?? parseImportExport;
  cachedParser?.load();

  for (const file of inputFiles) {
    const code = fs.readFileSync(file, "utf-8");
    const jsx = file.endsWith("x");
    const result = parse({ code, jsx });
    if (!result.ok) {
      errors.set(file, result.value);
      continue;
    }
    parsedFiles.set(file, result.value);
  }
  cachedParser?.save();

  //
  // resolve import module
  //

  // import graph as adjacency list
  const importRelations = new DefaultMap<string, ImportTarget[]>(() => []);

  for (const [file, parseOutput] of parsedFiles) {
    for (const e of parseOutput.imports) {
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
      const source = resolveImportSource(file, e.source);
      importRelations
        .get(file)
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

  for (const [file, parseOutput] of parsedFiles) {
    for (const e of parseOutput.imports.filter((e) => e.reExport)) {
      // TODO: need to resolve re-export chain
      // e.namespace;

      for (const el of e.bindings) {
        exportUsages.get(file).push({
          name: el.name,
          used: isUsedExport(file, el.name),
          position: e.position,
          comment: e.comment,
        });
      }
    }

    for (const e of parseOutput.exports) {
      for (const el of e.bindings) {
        exportUsages.get(file).push({
          name: el.name,
          used: isUsedExport(file, el.name),
          position: e.position,
          comment: e.comment,
        });
      }
    }
  }

  return {
    parsedFiles,
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
