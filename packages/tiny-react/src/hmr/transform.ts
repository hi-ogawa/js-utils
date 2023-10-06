//
// limitations
//
// - it requires explicit magic pragma to list component by
//   - /* @hmr SomeComponent */
//
// - component cannot be declared via `const` and it must be either
//   - function SomeComponent() { ... } or
//   - let SomeComponent = ...`
//
// - change in other code in the same file won't cause refresh
//

const PRAGMA_RE = /\/\*\s*@hmr\s+(.*)\s*\*\//g;

export function hmrTransform(code: string): string | undefined {
  let names = [...code.matchAll(PRAGMA_RE)].map((match) => match[1]);
  names = [...new Set(names)];
  if (names.length === 0) {
    return;
  }
  const extraCode = names.map((name) => wrapCreateHmrComponent(name));
  return HEADER_CODE + code + extraCode + FOOTER_CODE;
}

// re-assigning over function declaration is sketchy but seems to "work"
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
