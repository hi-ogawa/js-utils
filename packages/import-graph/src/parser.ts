import { Err, Ok, type Result, tinyassert } from "@hiogawa/utils";
import ts from "typescript";

export function parseImportExport({
  code,
  isTsx,
}: {
  code: string;
  isTsx: boolean;
}): Result<ParseOutput, ts.Diagnostic[]> {
  // access typescript AST via `ts.transpileModule` with custom transformer
  // cf. https://gist.github.com/hi-ogawa/cb338b4765d25321b120b2a47819abcc

  let result: ParseOutput;

  const transpileOutput = ts.transpileModule(code, {
    compilerOptions: {},
    fileName: isTsx ? "__dummy.tsx" : "__dummy.ts",
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
    return Err(transpileOutput.diagnostics);
  }

  tinyassert(result!);
  return Ok(result);
}

export interface ParseOutput {
  importInfos: ImportInfo[];
  exportInfos: ExportInfo[];
}

// TODO: handle dynamic import?
interface ImportInfo {
  source: string;
  specifiers: { name: string; propertyName?: string }[];
  specifierStar: boolean;
  reExport: boolean;
  position: number;
}

interface ExportInfo {
  name: string;
  propertyName?: string;
  position: number;
}

function analyzeInner(node: ts.SourceFile): ParseOutput {
  const result: ParseOutput = {
    importInfos: [],
    exportInfos: [],
  };

  for (const stmt of node.statements) {
    // import d1 from "./dep1";
    // import { d2 } from "./dep2";
    // import { d3 as d4 } from "./dep3";
    // import * as d5 from "./dep4";
    if (ts.isImportDeclaration(stmt)) {
      tinyassert(ts.isStringLiteral(stmt.moduleSpecifier));

      const info: ImportInfo = {
        source: stmt.moduleSpecifier.text,
        specifiers: [],
        specifierStar: false,
        position: stmt.getStart(),
        reExport: false,
      };
      result.importInfos.push(info);

      if (stmt.importClause) {
        // import d1 from "./dep1";
        if (stmt.importClause.name) {
          info.specifiers.push({ name: "default" });
        }
        if (stmt.importClause.namedBindings) {
          // import { d2 } from "./dep2";
          // import { d3 as d4 } from "./dep3";
          if (ts.isNamedImports(stmt.importClause.namedBindings)) {
            for (const e of stmt.importClause.namedBindings.elements) {
              info.specifiers.push({
                name: e.name.text,
                propertyName: e.propertyName?.text,
              });
            }
          }
          // import * as d5 from "./dep4";
          if (ts.isNamespaceImport(stmt.importClause.namedBindings)) {
            info.specifierStar = true;
          }
        }
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

        const info: ImportInfo = {
          source: stmt.moduleSpecifier.text,
          specifiers: [],
          specifierStar: false,
          position: stmt.getStart(),
          reExport: true,
        };
        result.importInfos.push(info);

        if (stmt.exportClause) {
          // export { r1 } from "./re-dep1";
          // export { r2 as r3 } from "./re-dep2";
          tinyassert(ts.isNamedExports(stmt.exportClause));
          for (const e of stmt.exportClause.elements) {
            info.specifiers.push({
              name: e.name.text,
              propertyName: e.propertyName?.text,
            });
          }
        }

        // export * from "./re-dep1";
        // (for star re-export, `exportClause` becomes `undefined` instead of `ts.isNamespaceExport`)
        if (!stmt.exportClause) {
          info.specifierStar = true;
        }
        continue;
      }

      // export { f3 as f4 };
      tinyassert(stmt.exportClause);
      tinyassert(ts.isNamedExports(stmt.exportClause));
      for (const e of stmt.exportClause.elements) {
        result.exportInfos.push({
          name: e.name.text,
          propertyName: e.propertyName?.text,
          position: e.getStart(),
        });
      }
      continue;
    }

    // export default () => {}
    if (ts.isExportAssignment(stmt)) {
      result.exportInfos.push({
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
          result.exportInfos.push({
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
        result.exportInfos.push({
          name,
          position: stmt.getStart(),
        });
      }
      continue;
    }
  }

  return result;
}
