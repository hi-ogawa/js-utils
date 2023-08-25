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
        type: "named";
        name: string; // x
      }
    | {
        // import * from "a"
        type: "namespace";
      }
    | {
        // import "a"
        type: "sideEffect";
      };
}

type ModuleSource = {
  type: "external" | "internal" | "unknown";
  source: string; // resolved file path if not external
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

  const relations: ImportRelation[] = [];

  // TODO: resolve module source
  // - relative
  // - file extension (e.g. "./some" => "./some.ts")
  // - index (e.g. "." => "./index.ts")
  // - tsconfig paths?
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
// https://www.typescriptlang.org/tsconfig#moduleResolution
function resolveImportModule(
  containingFile: string,
  source: string,
  fs: Fs
): ModuleSource {
  // external
  // TODO: extra resolution for tsconfig (e.g. baseUrl, paths)
  if (!source.startsWith(".")) {
    return {
      type: "external",
      source,
    };
  }

  //
  // poor-man's module path resolusion
  //

  // normalize relative path
  const fileDir = path.dirname(containingFile);
  source = path.normalize(path.join(fileDir, source));

  // "." => "./index"
  // "./dir" => "./dir/index"
  if (fs.statSync(source, { throwIfNoEntry: false })?.isDirectory()) {
    source = path.join(source, "index");
  }

  // "./file" => "./file.ts"
  if (!fs.existsSync(source)) {
    for (const ext of ["ts", "tsx", "js", "jsx"]) {
      const sourceExt = source + "." + ext;
      if (fs.existsSync(sourceExt)) {
        source = sourceExt;
        break;
      }
    }
  }

  return {
    type: fs.existsSync(source) ? "internal" : "unknown",
    source,
  };
}
