import type { ParseOutput } from "./parser";

interface Entry {
  file: string;
  parseOutput: ParseOutput;
}

//
// normalize import relation
//

interface ImportNamespaceInfo {
  source: string;
  position: number;
}

interface ImportNameInfo {
  source: string;
  name: string;
  nameAfter?: string;
  position: number;
}

interface ReExportNamespaceInfo {
  source: string;
  position: number;
}

interface ReExportNameInfo {
  source: string;
  name: string;
  nameBefore?: string;
  position: number;
}

function normalizeParseOutput(e: Entry) {
  e.file;
  e.parseOutput;
}

//
// graph builder
//

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
    // e.parseOutput.importInfos;
    // e.parseOutput.exportInfos;
  }

  // dependencies

  // resolve "index.js"

  // normalize file path
  // - relative
  //   - "."
  //   - "./abc"
  //   - "../~~~"
  // - others
  //   -  node
  // - TODO: tsconfig paths

  // TODO
  // resolve star re-export names
}
