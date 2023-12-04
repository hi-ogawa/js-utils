import fs from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  DefaultMap,
  assertUnreachable,
  tinyassert,
  wrapErrorAsync,
} from "@hiogawa/utils";
import { type ParseOutput, type ParsedBase, parseImportExport } from "./parser";

interface ImportTarget {
  source: ImportSource;
  usage: ImportUsage;
  node: ParsedBase;
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
  node: ParsedBase;
};

export type ImportRelations = DefaultMap<string, ImportTarget[]>;

// 1. parse files
// 2. resolve import source
// 3. check unused exports
export async function runner(
  inputFiles: string[],
  options?: { parse?: typeof parseImportExport }
) {
  // normalize relative path to match with `resolveImportSource` (e.g. "./x.ts" => "x.ts")
  inputFiles = inputFiles.map((f) => path.normalize(f));

  //
  // extract import/export
  //
  const parsedFiles = new Map<string, ParseOutput>();
  const errors = new Map<string, unknown>();
  const parse = options?.parse ?? parseImportExport;
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
      const source = await resolveImportSourceExperimental(
        file,
        e.source,
        // TODO: baseDir as cli option
        process.cwd(),
        import.meta.resolve!
      );
      // const source = await resolveImportSource(file, e.source);
      const node: ParsedBase = {
        position: e.position,
        comment: e.comment,
      };
      importRelations
        .get(file)
        .push(...usages.map((usage) => ({ source, usage, node })));
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
          node: {
            position: e.position,
            comment: e.comment,
          },
        });
      }
    }

    for (const e of parseOutput.exports) {
      for (const el of e.bindings) {
        exportUsages.get(file).push({
          name: el.name,
          used: isUsedExport(file, el.name),
          node: {
            position: e.position,
            comment: e.comment,
          },
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

// use `import.meta.resolve` to resolve import source
// so that users can use custom loader (e.g. tsx) to support what they need.
// https://nodejs.org/docs/latest-v18.x/api/esm.html#importmetaresolvespecifier
// TODO: performance-wise this would be probably slower?
async function resolveImportSourceExperimental(
  containingFile: string,
  source: string,
  baseDir: string,
  resolve: Exclude<ImportMeta["resolve"], undefined>
): Promise<ImportSource> {
  if (isBuiltin(source)) {
    return {
      type: "external",
      name: source,
    };
  }
  const parentUrl = pathToFileURL(path.join(baseDir, containingFile));
  // TODO: standardized as "sync" but still "async" in old nodejs
  // TODO: also what standardized doesn't throw when not found. https://github.com/nodejs/node/pull/49038
  //       Do we still need to do fs.existsSync to check?
  const resolved = await wrapErrorAsync(async () => resolve(source, parentUrl));
  if (!resolved.ok) {
    return {
      type: "unknown",
      name: source,
    };
  }
  const sourcePath = fileURLToPath(resolved.value);
  if (!fs.existsSync(sourcePath)) {
    return {
      type: "unknown",
      name: source,
    };
  }
  const relativePath = path.relative(baseDir, sourcePath);
  if (relativePath.startsWith("..")) {
    return {
      type: "external",
      name: source,
    };
  }
  return {
    type: "internal",
    name: relativePath,
  };
}

// cf.
// https://nodejs.org/api/esm.html#import-specifiers
// https://nodejs.org/api/modules.html#all-together
// https://www.typescriptlang.org/tsconfig#moduleResolution
export async function resolveImportSource(
  containingFile: string,
  source: string
): Promise<ImportSource> {
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
  const stat = await wrapErrorAsync(() => fs.promises.stat(tmpSource));
  if (stat.ok && stat.value.isDirectory()) {
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
// circular import
//

type ImportEdge = [importer: string, edge: ImportTarget];

export function findCircularImport(relations: ImportRelations) {
  // dfs on directed graph
  const adj = new Map(relations.entries());
  const visited = new Set<string>();
  const path = new Set<string>(); // dfs tree path
  const parentMap = new Map<string, ImportEdge>();
  const backEdges: ImportEdge[] = [];

  function dfs(v: string) {
    visited.add(v);
    path.add(v);
    for (const target of adj.get(v) ?? []) {
      if (target.source.type !== "internal") {
        continue;
      }
      const u = target.source.name;
      if (path.has(u)) {
        backEdges.push([v, target]);
        continue;
      }
      if (visited.has(u)) {
        continue;
      }
      parentMap.set(u, [v, target]);
      dfs(u);
    }
    path.delete(v);
  }

  for (const v of adj.keys()) {
    if (!visited.has(v)) {
      dfs(v);
    }
  }

  // cycle can be traversed and formatted separately based on this minimal data
  return { parentMap, backEdges };
}

export function formatCircularImportError(
  backEdge: ImportEdge,
  parentMap: Map<string, ImportEdge>
) {
  const cycle: [string, ImportTarget][] = [];
  const root = backEdge[1].source.name;
  let v = backEdge[0];
  while (v !== root) {
    const p = parentMap.get(v);
    tinyassert(p);
    cycle.push(p);
    v = p[0];
  }
  cycle.push(backEdge);
  cycle.reverse();

  const lines: string[] = [];
  for (const [v, target] of cycle) {
    const line = `${v}:${target.node.position[0]} - ${formatImportUsage(
      target.usage
    )}`;
    lines.push(line);
  }

  return { cycle, lines };
}

function formatImportUsage(usage: ImportUsage) {
  if (usage.type === "named") {
    return usage.name;
  }
  if (usage.type === "namespace") {
    return "*";
  }
  if (usage.type === "sideEffect") {
    return "(side effect)";
  }
  assertUnreachable(usage);
}
