import { Err, Ok, type Result, tinyassert } from "@hiogawa/utils";
import ts from "typescript";

//
// collect and normalize import/export from typescript AST
//

export function parseImportExport({
  code,
  jsx,
}: {
  code: string;
  jsx: boolean;
}): Result<ParseOutput, ParseErrorInfo> {
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
          result = parseInner(code, sourceFile);
          return sourceFile;
        },
      ],
    },
  });

  if (transpileOutput.diagnostics && transpileOutput.diagnostics?.length > 0) {
    const diagnostics = transpileOutput.diagnostics.map((d) =>
      typeof d.messageText === "string" ? d.messageText : "(unknown)",
    );
    return Err({ diagnostics });
  }

  tinyassert(result!);
  return Ok(result);
}

interface ParseErrorInfo {
  diagnostics: string[];
}

export interface ParseOutput {
  imports: ParsedImport[];
  exports: ParsedExport[];
}

interface ParsedImport extends ParsedBase {
  source: string;
  // import { x as y } from "a"
  // export { x as y } from "a"
  bindings: { name: string; nameBefore?: string }[];
  // import * as x from "a"
  // export * from "a"
  namespace: boolean;
  // import "a"
  sideEffect: boolean;
  // export { x as y } from "a"
  // export * from "a"
  reExport: boolean;
}

interface ParsedExport extends ParsedBase {
  // export { x, y as z }
  // export default () => {}
  // export const x = () => {}
  // export default function x() {}
  // export function x() {}
  bindings: { name: string; nameBefore?: string }[];
}

export interface ParsedBase {
  position: [number, number]; // [line, column]
  comment: string; // aka. leading trivial (used for custom ignore comment)
}

function parseInner(inputCode: string, node: ts.SourceFile): ParseOutput {
  const result2: ParseOutput = {
    imports: [],
    exports: [],
  };

  for (const stmt of node.statements) {
    // import d1 from "./dep1";
    // import { d2 } from "./dep2";
    // import { d3 as d4 } from "./dep3";
    // import * as d5 from "./dep4";
    if (ts.isImportDeclaration(stmt)) {
      tinyassert(ts.isStringLiteral(stmt.moduleSpecifier));
      const source = stmt.moduleSpecifier.text;

      const parsed: ParsedImport = {
        source,
        bindings: [],
        namespace: false,
        sideEffect: false,
        reExport: false,
        position: resolvePosition(inputCode, stmt.getStart()),
        comment: parseComment(stmt),
      };
      result2.imports.push(parsed);

      if (stmt.importClause) {
        // import d1 from "./dep1";
        if (stmt.importClause.name) {
          parsed.bindings.push({
            name: stmt.importClause.name.text,
            nameBefore: "default",
          });
        }
        if (stmt.importClause.namedBindings) {
          // import { d2 } from "./dep2";
          // import { d3 as d4 } from "./dep3";
          if (ts.isNamedImports(stmt.importClause.namedBindings)) {
            for (const e of stmt.importClause.namedBindings.elements) {
              parsed.bindings.push({
                name: e.name.text,
                nameBefore: e.propertyName?.text,
              });
            }
          }
          // import * as d5 from "./dep4";
          if (ts.isNamespaceImport(stmt.importClause.namedBindings)) {
            parsed.namespace = true;
          }
        }
      } else {
        parsed.sideEffect = true;
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

        const parsed: ParsedImport = {
          source,
          bindings: [],
          namespace: false,
          sideEffect: false,
          reExport: true,
          position: resolvePosition(inputCode, stmt.getStart()),
          comment: parseComment(stmt),
        };
        result2.imports.push(parsed);

        if (stmt.exportClause) {
          // export { r1 } from "./re-dep1";
          // export { r2 as r3 } from "./re-dep2";
          tinyassert(ts.isNamedExports(stmt.exportClause));
          for (const e of stmt.exportClause.elements) {
            parsed.bindings.push({
              name: e.name.text,
              nameBefore: e.propertyName?.text,
            });
          }
        }

        // export * from "./re-dep1";
        // (for namespace re-export, it seems `exportClause` becomes `undefined` instead of `NamespaceExport`)
        if (!stmt.exportClause) {
          parsed.namespace = true;
        }
        continue;
      }

      // export { f3 as f4 };
      tinyassert(stmt.exportClause);
      tinyassert(ts.isNamedExports(stmt.exportClause));

      const parsed: ParsedExport = {
        bindings: [],
        position: resolvePosition(inputCode, stmt.getStart()),
        comment: parseComment(stmt),
      };
      result2.exports.push(parsed);

      for (const e of stmt.exportClause.elements) {
        parsed.bindings.push({
          name: e.name.text,
          nameBefore: e.propertyName?.text,
        });
      }
      continue;
    }

    // export default () => {}
    if (ts.isExportAssignment(stmt)) {
      result2.exports.push({
        bindings: [{ name: "default" }],
        position: resolvePosition(inputCode, stmt.getStart()),
        comment: parseComment(stmt),
      });
      continue;
    }

    // export const f = () => {};
    if (ts.isVariableStatement(stmt)) {
      const modifiers = stmt.modifiers?.map((m) => m.kind);
      if (modifiers && modifiers.includes(ts.SyntaxKind.ExportKeyword)) {
        for (const decl of stmt.declarationList.declarations) {
          tinyassert(ts.isIdentifier(decl.name));
          result2.exports.push({
            bindings: [{ name: decl.name.text }],
            position: resolvePosition(inputCode, stmt.getStart()),
            comment: parseComment(stmt),
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
        result2.exports.push({
          bindings: [{ name }],
          position: resolvePosition(inputCode, stmt.getStart()),
          comment: parseComment(stmt),
        });
      }
      continue;
    }
  }

  return result2;
}

function parseComment(node: ts.Node) {
  return node.getFullText().slice(0, node.getLeadingTriviaWidth()).trim();
}

function resolvePosition(input: string, position: number): [number, number] {
  const slice = input.slice(0, position);
  const lines = slice.split("\n");
  return [lines.length, lines.at(-1)!.length];
}
