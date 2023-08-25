import type { ParseOutput } from "./parser";

interface Entry {
  file: string;
  parseOutput: ParseOutput;
}

interface FileNode {
  file: string;
  names: string[]; // position
  external: boolean;
}

interface ExportNode {
  name: string;
}

export function buildGraph(entries: Entry[]) {
  // collect relevant files
  for (const e of entries) {
    e.file;
    e.parseOutput.importInfos;
    e.parseOutput.exportInfos;
  }

  // normalize files
  // - relative
  // - node_modules
  // - TODO: tsconfig paths

  // TODO
  // resolve star re-export names
}
