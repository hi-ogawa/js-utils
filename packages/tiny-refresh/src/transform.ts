import { tinyassert } from "@hiogawa/utils";
import { stripLiteral } from "strip-literal";
import { parseAstAsync } from "vite";

interface HmrTransformOptions {
  runtime: string; // e.g. "react", "preact/compat", "@hiogawa/tiny-react"
  refreshRuntime: string; // allow "@hiogawa/tiny-react" to re-export refresh runtime by itself to simplify dependency
  bundler?: "vite" | "webpack4";
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
    FOOTER_CODE_VITE,
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

export async function hmrTransform2(
  code: string,
  options: HmrTransformOptions
) {
  const result = await analyzeCode(code);
  if (result.errors.length || result.entries.length === 0) {
    return;
  }
  let footer = /* js */ `
import * as $$runtime from "${options.runtime}";
import * as $$refresh from "${options.refreshRuntime}";
const $$registry = $$refresh.createHmrRegistry(
  {
    createElement: $$runtime.createElement,
    useReducer: $$runtime.useReducer,
    useEffect: $$runtime.useEffect,
  },
  ${options.debug ?? false},
);
`;
  for (const { id, hooks } of result.entries) {
    footer += /* js */ `
if (import.meta.hot && typeof ${id} === "function" && ${id}.length <= 1) {
  ${id} = $$refresh.createHmrComponent(
    $$registry, "${id}", ${id},
    { key: ${JSON.stringify(hooks.join("/"))}, remount: false },
    import.meta.hot,
  );
}
`;
  }
  footer += `
if (import.meta.hot) {
  $$refresh.setupHmrVite(import.meta.hot, $$registry);
  () => import.meta.hot.accept();
}
`;
  // no need to manipulate sourcemap since transform only appends
  return result.outCode + footer;
}

import type * as estree from "estree";

// extend types for rollup ast with node position
declare module "estree" {
  interface BaseNode {
    start: number;
    end: number;
  }
}

type HotEntry = {
  id: string;
  hooks: string[];
};

const HOOK_CALL_RE = /\b(use\w*)\s*\(/g;

async function analyzeCode(code: string) {
  const ast = await parseAstAsync(code);
  const errors: unknown[] = [];

  // TODO: collect also non-exported functions with a capitalized names
  const entries: HotEntry[] = [];

  // replace "export const" with "export let"
  let outCode = code;

  // loop exports
  // https://github.com/hi-ogawa/vite-plugins/blob/243064edcf80429be13bee81c0dc1d7bea670f4b/packages/react-server/src/plugin/ast-utils.ts#L14
  for (const node of ast.body) {
    // named exports
    if (node.type === "ExportNamedDeclaration") {
      if (node.declaration) {
        if (node.declaration.type === "FunctionDeclaration") {
          /**
           * export function foo() {}
           */
          entries.push({
            id: node.declaration.id.name,
            hooks: analyzeFunction(code, node.declaration).hooks,
          });
        } else if (node.declaration.type === "VariableDeclaration") {
          /**
           * export const foo = 1, bar = 2
           */
          // replace "const" to "let"
          if (node.declaration.kind === "const") {
            const start = node.declaration.start;
            outCode = replaceCode(outCode, start, start + 5, "let  ");
          }
          for (const decl of node.declaration.declarations) {
            if (
              decl.id.type === "Identifier" &&
              decl.init &&
              decl.init.type === "ArrowFunctionExpression"
            ) {
              entries.push({
                id: decl.id.name,
                hooks: analyzeFunction(code, decl.init).hooks,
              });
            } else {
              errors.push(decl);
            }
          }
        } else {
          errors.push(node);
        }
      } else {
        /**
         * export { foo, bar } from './foo'
         * export { foo, bar as car }
         */
        errors.push(node);
      }
    }

    // default export
    if (node.type === "ExportDefaultDeclaration") {
      /**
       * export default function foo() {}
       */
      if (
        node.declaration.type === "FunctionDeclaration" &&
        node.declaration.id
      ) {
        entries.push({
          id: node.declaration.id.name,
          hooks: analyzeFunction(code, node.declaration).hooks,
        });
      } else {
        errors.push(node);
      }
    }

    /**
     * export * from './foo'
     */
    if (node.type === "ExportAllDeclaration") {
      errors.push(node);
    }
  }
  return {
    entries,
    outCode,
    errors,
  };
}

function analyzeFunction(
  code: string,
  node:
    | estree.FunctionDeclaration
    | estree.ArrowFunctionExpression
    | estree.MaybeNamedFunctionDeclaration
) {
  const bodyCode = code.slice(node.body.start, node.body.end);
  const bodyCodeStrip = stripLiteral(bodyCode);
  const matches = bodyCodeStrip.matchAll(HOOK_CALL_RE);
  const hooks = [...matches].map((m) => m[1]!);
  return { hooks };
}

function replaceCode(
  code: string,
  start: number,
  end: number,
  content: string
) {
  return code.slice(0, start) + content + code.slice(end);
}
