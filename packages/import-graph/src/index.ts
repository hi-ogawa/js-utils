import { tinyassert, typedBoolean } from "@hiogawa/utils";
import * as esModuleLexer from "es-module-lexer";

interface ImportInfo {
  source: string;
  dynamic: boolean;
  specifiers: string[];
  specifierDefault: boolean;
  specifierStar: boolean;
  position: number;
}

interface ExportInfo {
  name: string; // include "default"
  position: number;
}

export function analyzeCode({ code }: { code: string }) {
  const [esmImports, esmExports] = esModuleLexer.parse(code);
  return {
    importInfos: esmImports
      .map((e) => parseLexerImportResult(code, e))
      .filter(typedBoolean),
    exportInfos: esmExports.map((e) => parseLexerExportResult(code, e)),
  };
}

function parseLexerImportResult(
  code: string,
  result: esModuleLexer.ImportSpecifier
): ImportInfo | undefined {
  // skip import.meta
  if (result.d === -2) {
    return;
  }

  // skip if lexer cannot resolve source (e.g. import("./" + "ab.js"))
  const source = result.n;
  if (!source) {
    return;
  }

  // dynamic import
  if (result.d >= 0) {
    return {
      source,
      position: result.ss,
      dynamic: true,
      specifiers: [],
      specifierDefault: false,
      specifierStar: false,
    };
  }

  // parse specifiers for static import
  tinyassert(result.d === -1);
  const codeImportDecl = code.slice(result.ss, result.se);
  const declInfo = parseImportDecl(codeImportDecl);

  return {
    source,
    position: result.ss,
    dynamic: false,
    ...declInfo,
  };
}

function parseImportDecl(
  code: string
): Pick<ImportInfo, "specifiers" | "specifierDefault" | "specifierStar"> {
  // import * as someStar from ...
  // import { someName, ... } from ...
  // import { someName as someRename, ... } from ...
  // import someDefault from ...
  // import someDefault, { andSomeName, ... } from ...

  // TODO

  code;
  return {
    specifiers: [],
    specifierDefault: false,
    specifierStar: false,
  };
}

function parseLexerExportResult(
  _code: string,
  result: esModuleLexer.ExportSpecifier
): ExportInfo {
  return { name: result.n, position: result.s };
}
