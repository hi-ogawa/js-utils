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
          result = analyzeInner(code, sourceFile);
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

interface ParseOutput2 {
  imports: ParsedImport[];
  exports: ParsedExport[];
}

interface ParsedImport extends ParsedBase {
  source: string;
  // import { x as y } from "a"
  // export { x as y } from "a"
  elements: { name: string; propertyName?: string }[];
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
  elements: { name: string; propertyName?: string }[];
}

interface ParsedBase {
  position: [number, number]; // [line, column]
  comment: string; // aka. leading trivial (used for custom ignore comment)
}

// TODO: configurable?
const IGNORE_COMMENT = "icheck-ignore";

function checkIgnoreComment(node: ts.Node): boolean {
  const trivia = node.getFullText().slice(0, node.getLeadingTriviaWidth());
  return trivia.includes(IGNORE_COMMENT);
}

function analyzeInner(inputCode: string, node: ts.SourceFile): ParseOutput {
  const result: ParseOutput = {
    bareImports: [],
    namespaceImports: [],
    namedImports: [],
    namespaceReExports: [],
    namedReExports: [],
    namedExports: [],
  };
  const result2: ParseOutput2 = {
    imports: [],
    exports: [],
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

      const parsed: ParsedImport = {
        source,
        elements: [],
        namespace: false,
        sideEffect: false,
        reExport: false,
        position: resolvePosition(inputCode, stmt.getStart()),
        comment: parseComment(node),
      };
      result2.imports.push(parsed);

      if (stmt.importClause) {
        // import d1 from "./dep1";
        if (stmt.importClause.name) {
          parsed.elements.push({ name: "default" });
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
              parsed.elements.push({
                name: e.name.text,
                propertyName: e.propertyName?.text,
              });
            }
          }
          // import * as d5 from "./dep4";
          if (ts.isNamespaceImport(stmt.importClause.namedBindings)) {
            parsed.namespace = true;
            result.namespaceImports.push({
              source,
              position: stmt.importClause.getStart(),
            });
          }
        }
      } else {
        parsed.sideEffect = true;
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

        const parsed: ParsedImport = {
          source,
          elements: [],
          namespace: false,
          sideEffect: false,
          reExport: true,
          position: resolvePosition(inputCode, stmt.getStart()),
          comment: parseComment(node),
        };
        result2.imports.push(parsed);

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
            parsed.elements.push({
              name: e.name.text,
              propertyName: e.propertyName?.text,
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
          parsed.namespace = true;
        }
        continue;
      }

      // export { f3 as f4 };
      tinyassert(stmt.exportClause);
      tinyassert(ts.isNamedExports(stmt.exportClause));

      const parsed: ParsedExport = {
        elements: [],
        position: resolvePosition(inputCode, stmt.getStart()),
        comment: parseComment(node),
      };
      result2.exports.push(parsed);

      for (const e of stmt.exportClause.elements) {
        result.namedExports.push({
          name: e.propertyName?.text ?? e.name.text,
          position: e.getStart(),
        });
        parsed.elements.push({
          name: e.name.text,
          propertyName: e.propertyName?.text,
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
      result2.exports.push({
        elements: [{ name: "default" }],
        position: resolvePosition(inputCode, stmt.getStart()),
        comment: parseComment(node),
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
          result2.exports.push({
            elements: [{ name: decl.name.text }],
            position: resolvePosition(inputCode, stmt.getStart()),
            comment: parseComment(node),
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
        result2.exports.push({
          elements: [{ name }],
          position: resolvePosition(inputCode, stmt.getStart()),
          comment: parseComment(node),
        });
      }
      continue;
    }
  }

  return result;
}

function parseComment(node: ts.Node) {
  return node.getFullText().slice(0, node.getLeadingTriviaWidth());
}

function resolvePosition(input: string, position: number): [number, number] {
  const slice = input.slice(0, position);
  const lines = slice.split("\n");
  return [lines.length, lines.at(-1)!.length];
}
