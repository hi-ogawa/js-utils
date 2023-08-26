import nodeFs from "node:fs";
import path from "node:path";
import { type ParseOutput, parseImportExport } from "./parser";

type Fs = typeof import("node:fs");

interface ImportRelation {
  file: string;
  moduleSource: ModuleSource;
  usage:
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
}

type ModuleSource = {
  type: "external" | "internal" | "unknown";
  source: string; // resolved file path if "internal"
};

export function run(inputFiles: string[], options?: { fs?: Fs }) {
  const fs = options?.fs ?? nodeFs;

  const entries: { file: string; parseOutput: ParseOutput }[] = [];
  const errors: { file: string; error: unknown }[] = [];

  // extract import/export
  for (const file of inputFiles) {
    // TODO(perf): cache
    // TODO(perf): worker
    const code = fs.readFileSync(file, "utf-8");
    const jsx = file.endsWith("x");
    const result = parseImportExport({ code, jsx });
    if (!result.ok) {
      errors.push({ file, error: result.value });
      continue;
    }
    entries.push({
      file,
      parseOutput: result.value,
    });
  }

  // resolve import module
  const relations: ImportRelation[] = [];
  for (const entry of entries) {
    for (const e of entry.parseOutput.bareImports) {
      relations.push({
        file: entry.file,
        moduleSource: resolveImportModule(entry.file, e.source, fs),
        usage: {
          type: "sideEffect",
        },
      });
    }
    for (const e of entry.parseOutput.namedImports) {
      relations.push({
        file: entry.file,
        moduleSource: resolveImportModule(entry.file, e.source, fs),
        usage: {
          type: "named",
          name: e.name,
        },
      });
    }
    for (const e of entry.parseOutput.namespaceImports) {
      relations.push({
        file: entry.file,
        moduleSource: resolveImportModule(entry.file, e.source, fs),
        usage: {
          type: "namespace",
        },
      });
    }
    for (const e of entry.parseOutput.namedReExports) {
      relations.push({
        file: entry.file,
        moduleSource: resolveImportModule(entry.file, e.source, fs),
        usage: {
          type: "named",
          name: e.name,
        },
      });
    }
    for (const e of entry.parseOutput.namespaceReExports) {
      relations.push({
        file: entry.file,
        moduleSource: resolveImportModule(entry.file, e.source, fs),
        usage: {
          type: "namespace",
        },
      });
    }
  }

  // TODO: build graph

  // TODO: analyze
  // - unused exports

  return { entries, errors, relations };
}

// cf.
// https://nodejs.org/api/esm.html#import-specifiers
// https://nodejs.org/api/modules.html#all-together
// https://www.typescriptlang.org/tsconfig#moduleResolution
function resolveImportModule(
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
      source,
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
        source: tmpSource,
      }
    : {
        type: "unknown",
        source,
      };
}
