import nodeFs from "node:fs";
import path from "node:path";
import { DefaultMap, LruCache, hashString, memoize } from "@hiogawa/utils";
import {
  name as packageName,
  version as packageVersion,
} from "../package.json";
import { type ParseOutput, parseImportExport } from "./parser";

type Fs = typeof import("node:fs");

// TODO: rework structure

// TODO: track code position for error message
interface ImportTarget {
  source: ModuleSource;
  usage: ModuleUsage;
}

type ModuleSource = {
  type: "external" | "internal" | "unknown";
  name: string; // resolved file path if "internal"
};

type ModuleUsage =
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

type ModuleExportUsage = {
  name: string;
  used: boolean;
  position: number;
};

export function run(
  inputFiles: string[],
  options?: { fs?: Fs; cache?: boolean }
) {
  const fs = options?.fs ?? nodeFs;

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

  // as adjacency list
  const importRelations = new DefaultMap<string, ImportTarget[]>(() => []);

  for (const entry of entries) {
    // TODO: cache resolveImportSource?
    for (const e of entry.parseOutput.bareImports) {
      importRelations.get(entry.file).push({
        source: resolveImportSource(entry.file, e.source, fs),
        usage: {
          type: "sideEffect",
        },
      });
    }
    for (const e of entry.parseOutput.namedImports) {
      importRelations.get(entry.file).push({
        source: resolveImportSource(entry.file, e.source, fs),
        usage: {
          type: "named",
          name: e.name,
        },
      });
    }
    for (const e of entry.parseOutput.namespaceImports) {
      importRelations.get(entry.file).push({
        source: resolveImportSource(entry.file, e.source, fs),
        usage: {
          type: "namespace",
        },
      });
    }
    for (const e of entry.parseOutput.namedReExports) {
      importRelations.get(entry.file).push({
        source: resolveImportSource(entry.file, e.source, fs),
        usage: {
          type: "named",
          name: e.nameBefore ?? e.name,
        },
      });
    }
    for (const e of entry.parseOutput.namespaceReExports) {
      importRelations.get(entry.file).push({
        source: resolveImportSource(entry.file, e.source, fs),
        usage: {
          type: "namespace",
        },
      });
    }
  }

  //
  // collect internal import usages
  //

  const importUsages = new DefaultMap<string, ModuleUsage[]>(() => []);
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
  const exportUsages = new DefaultMap<string, ModuleExportUsage[]>(() => []);

  for (const entry of entries) {
    // TODO: resolve re-export chain?
    // entry.parseOutput.namespaceReExports

    for (const e of entry.parseOutput.namedReExports) {
      exportUsages.get(entry.file).push({
        name: e.name,
        used: isUsedExport(entry.file, e.name),
        position: e.position,
      });
    }
    for (const e of entry.parseOutput.namedExports) {
      exportUsages.get(entry.file).push({
        name: e.name,
        used: isUsedExport(entry.file, e.name),
        position: e.position,
      });
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
  source: string,
  fs: Fs
): ModuleSource {
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

// configurable
const CACHE_FILE = `node_modules/.cache/${packageName}/v${packageVersion}/parseImportExport`;
const CACHE_SIZE = 1000_000;

function createCachedParser() {
  const fs = nodeFs;
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
