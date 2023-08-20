import * as esModuleLexer from "es-module-lexer";

async function main() {
  await esModuleLexer.init;
}

// star import?

// interface AnalyzeResult {
//   dependencies
//   dependents
// }

function analyzeCode({ code }: { path: string; code: string }) {
  const [esmImports, esmExports] = esModuleLexer.parse(code);
  esmImports;
}

main();
