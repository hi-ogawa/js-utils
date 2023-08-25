import { type ParseOutput, parseImportExport } from "./parser";

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
  // - index
  // - tsconfig paths?
  // - check node_modules?
  for (const e of entries) {
    e.parseOutput.namedImports;
    e.parseOutput.namespaceImports;
    e.parseOutput.namedReExports;
    e.parseOutput.namespaceReExports;
  }

  // TODO: build graph

  // TODO: analyze
  // - unused exports

  return { entries, errors };
}
