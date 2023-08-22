import * as esModuleLexer from "es-module-lexer";

async function main() {
  await esModuleLexer.init;
}

// star import?

// interface AnalyzeResult {
//   dependencies
//   dependents
// }

interface ImportInfo {
  source: string;
  // specifier
}

function analyzeCode({ code }: { path: string; code: string }) {
  const [esmImports, esmExports] = esModuleLexer.parse(code);
  esmImports[0].a;
}

main();
