import { Err, Ok, type Result, tinyassert } from "@hiogawa/utils";
import ts from "typescript";

//
// parse AST to collect import/export
//

export function parseImportExport({
  code,
  jsx,
}: {
  code: string;
  jsx: boolean;
}): Result<ParseOutput, { diagnostics: string[] }> {
  // access typescript AST via `ts.transpileModule` with custom transformer
  // cf. https://gist.github.com/hi-ogawa/cb338b4765d25321b120b2a47819abcc

  let result: ParseOutput;

  const transpileOutput = ts.transpileModule(code, {
    compilerOptions: {},
    fileName: jsx ? "__dummy.tsx" : "__dummy.ts",
    reportDiagnostics: true,
    transformers: {
      before: [
        (_ctx) => (sourceFile) => {
          result = analyzeInner(sourceFile);
          return sourceFile;
        },
      ],
    },
  });

  if (transpileOutput.diagnostics && transpileOutput.diagnostics?.length > 0) {
    const diagnostics = transpileOutput.diagnostics.map((d) =>
      typeof d.messageText === "string" ? d.messageText : "(unknown)"
    );
    return Err({ diagnostics });
  }

  tinyassert(result!);
  return Ok(result);
}

// TODO: rework structure
export interface ParseOutput {
  bareImports: BareImportInfo[];
  namespaceImports: NamespaceImportInfo[];
  namedImports: NamedImportInfo[];
  namespaceReExports: NamespaceReExportInfo[];
  namedReExports: NamedReExportInfo[];
  namedExports: NamedExportInfo[];
}

interface BareImportInfo {
  source: string;
  position: number;
}

interface NamespaceImportInfo {
  source: string;
  position: number;
}

interface NamedImportInfo {
  source: string;
  name: string;
  position: number;
}

// TODO: need extra steps to resolve re-exported identifiers
interface NamespaceReExportInfo {
  source: string;
  position: number;
}

interface NamedReExportInfo {
  source: string;
  name: string;
  nameBefore?: string;
  position: number;
}

interface NamedExportInfo {
  name: string;
  position: number;
}

// TODO: configurable?
const IGNORE_COMMENT = "icheck-ignore";

function checkIgnoreComment(node: ts.Node): boolean {
  const trivia = node.getFullText().slice(0, node.getLeadingTriviaWidth());
  return trivia.includes(IGNORE_COMMENT);
}

function analyzeInner(node: ts.SourceFile): ParseOutput {
  const result: ParseOutput = {
    bareImports: [],
    namespaceImports: [],
    namedImports: [],
    namespaceReExports: [],
    namedReExports: [],
    namedExports: [],
  };

  for (const stmt of node.statements) {
    if (checkIgnoreComment(stmt)) {
      continue;
    }

    // import d1 from "./dep1";
    // import { d2 } from "./dep2";
    // import { d3 as d4 } from "./dep3";
    // import * as d5 from "./dep4";
    if (ts.isImportDeclaration(stmt)) {
      tinyassert(ts.isStringLiteral(stmt.moduleSpecifier));
      const source = stmt.moduleSpecifier.text;

      if (stmt.importClause) {
        // import d1 from "./dep1";
        if (stmt.importClause.name) {
          result.namedImports.push({
            source,
            name: "default",
            position: stmt.importClause.getStart(),
          });
        }
        if (stmt.importClause.namedBindings) {
          // import { d2 } from "./dep2";
          // import { d3 as d4 } from "./dep3";
          if (ts.isNamedImports(stmt.importClause.namedBindings)) {
            for (const e of stmt.importClause.namedBindings.elements) {
              result.namedImports.push({
                source,
                name: e.propertyName?.text ?? e.name.text,
                position: e.getStart(),
              });
            }
          }
          // import * as d5 from "./dep4";
          if (ts.isNamespaceImport(stmt.importClause.namedBindings)) {
            result.namespaceImports.push({
              source,
              position: stmt.importClause.getStart(),
            });
          }
        }
      } else {
        result.bareImports.push({
          source,
          position: stmt.getStart(),
        });
      }
      continue;
    }

    // export { r1 } from "./re-dep1";
    // export { r2 as r3 } from "./re-dep2";
    // export * from "./re-dep3";
    // export { f3 as f4 };
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.moduleSpecifier) {
        tinyassert(ts.isStringLiteral(stmt.moduleSpecifier));
        const source = stmt.moduleSpecifier.text;

        if (stmt.exportClause) {
          // export { r1 } from "./re-dep1";
          // export { r2 as r3 } from "./re-dep2";
          tinyassert(ts.isNamedExports(stmt.exportClause));
          for (const e of stmt.exportClause.elements) {
            result.namedReExports.push({
              source,
              name: e.name.text,
              nameBefore: e.propertyName?.text,
              position: e.getStart(),
            });
          }
        }

        // export * from "./re-dep1";
        // (for namespace re-export, it seems `exportClause` becomes `undefined` instead of `NamespaceExport`)
        if (!stmt.exportClause) {
          result.namespaceReExports.push({
            source,
            position: stmt.getStart(),
          });
        }
        continue;
      }

      // export { f3 as f4 };
      tinyassert(stmt.exportClause);
      tinyassert(ts.isNamedExports(stmt.exportClause));
      for (const e of stmt.exportClause.elements) {
        result.namedExports.push({
          name: e.propertyName?.text ?? e.name.text,
          position: e.getStart(),
        });
      }
      continue;
    }

    // export default () => {}
    if (ts.isExportAssignment(stmt)) {
      result.namedExports.push({
        name: "default",
        position: stmt.getStart(),
      });
      continue;
    }

    // export const f = () => {};
    if (ts.isVariableStatement(stmt)) {
      const modifiers = stmt.modifiers?.map((m) => m.kind);
      if (modifiers && modifiers.includes(ts.SyntaxKind.ExportKeyword)) {
        for (const decl of stmt.declarationList.declarations) {
          tinyassert(ts.isIdentifier(decl.name));
          result.namedExports.push({
            name: decl.name.text,
            position: decl.getStart(),
          });
        }
      }
      continue;
    }

    // export default function f() {}
    // export function f() {}
    if (ts.isFunctionDeclaration(stmt)) {
      const modifiers = stmt.modifiers?.map((m) => m.kind);
      if (modifiers && modifiers.includes(ts.SyntaxKind.ExportKeyword)) {
        const name = modifiers.includes(ts.SyntaxKind.DefaultKeyword)
          ? "default"
          : stmt.name?.text;
        tinyassert(name);
        result.namedExports.push({
          name,
          position: stmt.getStart(),
        });
      }
      continue;
    }
  }

  return result;
}
