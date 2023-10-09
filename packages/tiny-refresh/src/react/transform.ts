import { tinyassert } from "@hiogawa/utils";

// based on packages/tiny-react/src/hmr/transform.ts

const PRAGMA_RE = /^\s*\/\/\s*@hmr/g;

interface HmrTransformOptions {
  bundler: "vite" | "webpack4";
}

export function hmrTransform(
  code: string,
  options: HmrTransformOptions
): string | undefined {
  const lines = code.split("\n");
  const newLines = [...lines];
  const extraCodes: string[] = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (line.match(PRAGMA_RE)) {
      const found = transformComponentDecl(lines[i + 1]);
      if (found) {
        newLines[i + 1] = found[0];
        extraCodes.push(
          wrapCreateHmrComponent(found[1], !line.includes("@hmr-unsafe"))
        );
      }
    }
  }
  if (extraCodes.length === 0) {
    return;
  }
  return [
    HEADER_CODE,
    ...newLines,
    ...extraCodes,
    options.bundler === "vite" ? FOOTER_CODE_VITE : FOOTER_CODE_WEBPACK4,
  ].join("\n");
}

const COMPONENT_DECL_RE = /(function|let|const)\s*(\w+)/;

// find identifier from the next line of "@hmr" comment
//   function SomeComponent
//   let SomeComponent
//   const SomeComponent (+ `const` will be transformed to `let`)
function transformComponentDecl(line: string): [string, string] | undefined {
  const match = line.match(COMPONENT_DECL_RE);
  if (match) {
    const [, declType, name] = match;
    if (declType === "const") {
      tinyassert(typeof match.index === "number");
      line = spliceString(line, match.index, "const".length, "let");
    }
    return [line, name];
  }
  return;
}

function spliceString(
  input: string,
  startIndex: number,
  deleteLength: number,
  inserted: string
) {
  return (
    input.slice(0, startIndex) +
    inserted +
    input.slice(startIndex + deleteLength)
  );
}

// re-assigning over function declaration is sketchy but seems to be okay
// cf. https://eslint.org/docs/latest/rules/no-func-assign
const wrapCreateHmrComponent = (name: string, remount: boolean) => /* js */ `
var $$tmp_${name} = ${name};
${name} = $$lib.createHmrComponent($$registry, $$tmp_${name}, { remount: ${remount} });
`;

// /* js */ comment is for https://github.com/mjbvz/vscode-comment-tagged-templates
const HEADER_CODE = /* js */ `
import * as $$lib from "@hiogawa/tiny-refresh/dist/react/runtime";
const $$registry = $$lib.createHmrRegistry();
`;

// for vite to detect, source code needs to include the exact "import.meta.hot.accept" expression.
const FOOTER_CODE_VITE = /* js */ `
if (import.meta.hot) {
  $$lib.setupHmrVite(import.meta.hot, $$registry);
  () => import.meta.hot.accept();
}
`;

const FOOTER_CODE_WEBPACK4 = /* js */ `
if (module.hot) {
  $$lib.setupHmrWebpack(module.hot, $$registry);
}
`;
