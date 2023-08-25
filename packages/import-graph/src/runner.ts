import { type ParseOutput, parseImportExport } from "./parser";
import path from "node:path";

interface VirtualFS {
  readFile: (file: string, encoding: "utf-8") => Promise<string>;
}

export async function run(inputFiles: string[], options?: { fs?: VirtualFS }) {
  const fs = options?.fs ?? (await import("node:fs/promises"));

  const entries: { file: string; parseOutput: ParseOutput }[] = [];
  const errors: { file: string; error: unknown }[] = [];

  // extract import/export
  for (const file of inputFiles) {
    // TODO(perf): cache
    // TODO(perf): worker
    const code = await fs.readFile(file, "utf-8");
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

  // TODO: resolve/normalize file path
  // - relative
  // - file extension (e.g. "./some-util" => "./some-utils.ts")
  // - index
  // - tsconfig paths?
  // - check node_modules?
  for (const entry of entries) {
    for (const e of entry.parseOutput.bareImports) {
      e.source = resolveImportSource(entry.file, e.source);
    }
    for (const e of entry.parseOutput.namedImports) {
      e.source = resolveImportSource(entry.file, e.source);
    }
    for (const e of entry.parseOutput.namespaceImports) {
      e.source = resolveImportSource(entry.file, e.source);
    }
    for (const e of entry.parseOutput.namedReExports) {
      e.source = resolveImportSource(entry.file, e.source);
    }
    for (const e of entry.parseOutput.namespaceReExports) {
      e.source = resolveImportSource(entry.file, e.source);
    }
  }

  // TODO: build graph

  // TODO: analyze
  // - unused exports

  return { entries, errors };
}

// cf. https://nodejs.org/api/esm.html#import-specifiers

function resolveImportSource(file: string, source: string) {
  const dir = path.dirname(file);

  // relative
  if (source.startsWith(".")) {
    return path.normalize(path.join(dir, source));
  }

  // otherwise external
  // TODO: tsconfig paths

  return source;
}
