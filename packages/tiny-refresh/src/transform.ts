import { tinyassert } from "@hiogawa/utils";

interface HmrTransformOptions {
  runtime: string; // e.g. "react", "preact/compat", "@hiogawa/tiny-react"
  refreshRuntime?: string; // allow "@hiogawa/tiny-react" to re-export refresh runtime by itself to simplify dependency
  bundler: "vite" | "webpack4";
  autoDetect?: boolean;
  debug?: boolean;
}

export function hmrTransform(
  code: string,
  options: HmrTransformOptions
): string | undefined {
  const lines = code.split("\n");
  const newLines = [...lines];
  const extraCodes: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const prevLine = lines[i - 1] ?? "";
    const line = lines[i];
    // disable per file
    if (line.startsWith("// @hmr-disable-all")) {
      return;
    }
    // disable per component
    if (prevLine.startsWith("// @hmr-disable")) {
      continue;
    }
    if (
      options.autoDetect
        ? line.match(AUTO_DETECT_RE)
        : prevLine.startsWith("// @hmr")
    ) {
      // extract name + transform from "const" to "let"
      const extracted = transformComponentDecl(line);
      if (!extracted) {
        console.error(
          `[tiny-refresh] invalid component definition in '${line}'`
        );
        continue;
      }
      const [transformed, name] = extracted;
      newLines[i] = transformed;
      extraCodes.push(
        wrapCreateHmrComponent(name, !prevLine.startsWith("// @hmr-unsafe"))
      );
    }
  }
  if (extraCodes.length === 0) {
    return;
  }
  return [
    headerCode(
      options.runtime,
      options.refreshRuntime ?? "@hiogawa/tiny-refresh",
      options.debug ?? false
    ),
    ...newLines,
    ...extraCodes,
    options.bundler === "vite" ? FOOTER_CODE_VITE : FOOTER_CODE_WEBPACK4,
  ].join("\n");
}

const AUTO_DETECT_RE =
  /^(export)?\s*(default)?\s*(function|var|let|const)\s*[A-Z]/;

const COMPONENT_DECL_RE = /(function|var|let|const)\s*(\w+)/;

// find identifier from the next line of "@hmr" comment
//   function SomeComponent
//   var SomeComponent
//   let SomeComponent
//   const SomeComponent (then `const` will be transformed to `let`)
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

// "exotic" component (e.g. React.forwardRef) will be filtered out since they are "object"
const wrapCreateHmrComponent = (name: string, remount: boolean) => /* js */ `
if (typeof ${name} === "function" && ${name}.length <= 1) {
  var $$tmp_${name} = ${name};
  ${name} = $$refresh.createHmrComponent($$registry, "${name}", $$tmp_${name}, { remount: ${remount} });
}
`;

// /* js */ comment is for https://github.com/mjbvz/vscode-comment-tagged-templates
const headerCode = (
  runtime: string,
  refresh: string,
  debug: boolean
) => /* js */ `
import * as $$runtime from "${runtime}";
import * as $$refresh from "${refresh}";
const $$registry = $$refresh.createHmrRegistry({
  createElement: $$runtime.createElement,
  useReducer: $$runtime.useReducer,
  useEffect: $$runtime.useEffect,
}, ${debug});
`;

// for vite to detect, source code needs to include the exact "import.meta.hot.accept" expression.
const FOOTER_CODE_VITE = /* js */ `
if (import.meta.hot) {
  $$refresh.setupHmrVite(import.meta.hot, $$registry);
  () => import.meta.hot.accept();
}
`;

const FOOTER_CODE_WEBPACK4 = /* js */ `
if (module.hot) {
  $$refresh.setupHmrWebpack(module.hot, $$registry);
}
`;
