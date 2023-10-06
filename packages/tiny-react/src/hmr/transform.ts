import { tinyassert } from "@hiogawa/utils";

//
// limitations of this primitive transform
// - it requires explicit magic pragma '// @hmr' before component declaration
// - change in other code in the same file won't cause refresh
//

const PRAGMA_RE = /^\s*\/\/\s*@hmr/g;

export function hmrTransform(code: string): string | undefined {
  const lines = code.split("\n");
  const newLines = [...lines];
  const componentNames: string[] = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (line.match(PRAGMA_RE)) {
      const found = transformComponentDecl(lines[i + 1]);
      if (found) {
        newLines[i + 1] = found[0];
        componentNames.push(found[1]);
      }
    }
  }
  if (componentNames.length === 0) {
    return;
  }
  const newCode = newLines.join("\n");
  const extraCode = [...new Set(componentNames)]
    .map((name) => wrapCreateHmrComponent(name))
    .join("\n");
  return HEADER_CODE + newCode + extraCode + FOOTER_CODE;
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
const wrapCreateHmrComponent = (name: string) => /* js */ `
var _$tmp_${name} = ${name};
${name} = _$hmr.createHmrComponent(_$registry, _$tmp_${name});
`;

// /* js */ comment is for https://github.com/mjbvz/vscode-comment-tagged-templates
const HEADER_CODE = /* js */ `
import * as _$lib from "@hiogawa/tiny-react";
import * as _$hmr from "@hiogawa/tiny-react/dist/hmr";
const _$registry = _$hmr.createHmrRegistry({
  h: _$lib.h,
  useState: _$lib.useState,
  useEffect: _$lib.useEffect,
});
`;

// for vite to detect, source code needs to include the exact "import.meta.hot.accept" expression.
const FOOTER_CODE = /* js */ `
if (import.meta.hot) {
  _$hmr.setupHmr(import.meta.hot, _$registry);
  () => import.meta.hot.accept();
}
`;
