// this simple semi-auto-injection requires
// - explicit magic pragma to list component /* @tiny-react.hmr SomeComponent */
// - component must be defined either `function SomeComponent() { ... }` or `let SomeComponent = ...` (not `const SomeComponent = ...`)

export interface HmrTransformOptions {
  ignore: string[];
}

const PRAGMA_RE = /\/\*\s*@tiny-react.hmr\s+(\w+)\s*\*\//;

export function hmrTransform(code: string, _options?: HmrTransformOptions) {
  const pragma = code.match(PRAGMA_RE);
  if (!pragma) {
    return code;
  }
  const names = pragma[1].split(",");
  const extraCode = names.map((name) => wrapCreateHmrComponent(name));
  return HEADER_CODE + code + extraCode + FOOTER_CODE;
}

// re-assigning over function declaration is sketchy but seems to "work"
// cf. https://eslint.org/docs/latest/rules/no-func-assign
const wrapCreateHmrComponent = (name: string) => /* js */ `

var _$tmp_${name} = ${name};
${name} = _$tinyReactHmr.createHmrComponent(_$registry, _$tmp_${name});

`;

// /* js */ comment is for https://github.com/mjbvz/vscode-comment-tagged-templates
const HEADER_CODE = /* js */ `

import _$tinyReact from "@hiogawa/tiny-react";
import _$tinyReactHmr from "@hiogawa/tiny-react/hmr";

const _$registry = _$tinyReactHmr.createHmrRegistry({
  h: _$tinyReact.h,
  useState: _$tinyReact.useState,
  useEffect: _$tinyReact.useEffect,
});

`;

// for vite to detect, source code needs to include the exact "import.meta.hot.accept" expression.
const FOOTER_CODE = /* js */ `

if (import.meta.hot) {
  _$tinyReactHmr.setupHmr(import.meta.hot, _$registry);
  () => import.meta.hot.accept();
}

`;
