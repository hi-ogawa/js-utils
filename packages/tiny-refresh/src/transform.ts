import type * as estree from "estree";
import { parseAstAsync } from "vite";

interface TransformOptions {
  runtime: string; // e.g. "react", "preact/compat", "@hiogawa/tiny-react"
  refreshRuntime: string; // allow "@hiogawa/tiny-react" to re-export refresh runtime by itself to simplify dependency
  debug?: boolean;
}

export async function transformVite(code: string, options: TransformOptions) {
  const result = await analyzeCode(code);
  if (result.errors.length || result.entries.length === 0) {
    return;
  }
  let footer = /* js */ `
import * as $$runtime from "${options.runtime}";
import * as $$refresh from "${options.refreshRuntime}";
if (import.meta.hot) {
  () => import.meta.hot.accept();
  const $$manager = $$refresh.createManager(
    import.meta.hot,
    {
      createElement: $$runtime.createElement,
      useReducer: $$runtime.useReducer,
      useEffect: $$runtime.useEffect,
    },
    ${options.debug ?? false},
  );
`;
  for (const { id, hooks } of result.entries) {
    footer += `\
  ${id} = $$manager.wrap("${id}", ${id}, ${JSON.stringify(hooks.join("/"))});
`;
  }
  footer += `\
  $$manager.setup();
}
`;
  // no need to manipulate sourcemap since transform only appends
  return result.outCode + footer;
}

// TODO: refactor with transformVite/Webpack
export async function transformWebpack(
  code: string,
  options: TransformOptions
) {
  const result = await analyzeCode(code);
  if (result.errors.length || result.entries.length === 0) {
    return;
  }
  let footer = /* js */ `
import * as $$runtime from "${options.runtime}";
import * as $$refresh from "${options.refreshRuntime}";
if (import.meta.webpackHot) {
  // 'hot.data' is passed from old module via hot.dispose(data)
  // https://webpack.js.org/api/hot-module-replacement/#dispose-or-adddisposehandler
  const hot = import.meta.webpackHot;
  const MANAGER_KEY = Symbol.for("tiny-refresh.manager");
  const $$manager = hot.data?.[MANAGER_KEY] ?? new $$refresh.Manager({
    hot: {},
    runtime: {
      createElement: $$runtime.createElement,
      useReducer: $$runtime.useReducer,
      useEffect: $$runtime.useEffect,
    },
    debug: ${options.debug ?? false},
  });
  hot.dispose(data => {
    data[MANAGER_KEY] = $$manager;
  });
  hot.accept();
`;
  for (const { id, hooks } of result.entries) {
    footer += `\
  ${id} = $$manager.wrap("${id}", ${id}, ${JSON.stringify(hooks.join("/"))});
`;
  }
  footer += `\
  if (hot.data?.[MANAGER_KEY]) {
    if (!$$manager.patch()) {
      hot.invalidate();
    }
  }
}
`;
  return result.outCode + footer;
}

//
// extract component declarations
//

// extend types for rollup ast with node position
declare module "estree" {
  interface BaseNode {
    start: number;
    end: number;
  }
}

type ParsedEntry = {
  id: string;
  hooks: string[];
};

const HOOK_CALL_RE = /\b(use\w*)\s*\(/g;
const COMPONENT_RE = /^[A-Z]/;

async function analyzeCode(code: string) {
  const ast = await parseAstAsync(code);
  const errors: unknown[] = [];

  // TODO: collect also non-exported functions with a capitalized names
  const entries: ParsedEntry[] = [];

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
          if (COMPONENT_RE.test(node.declaration.id.name)) {
            entries.push({
              id: node.declaration.id.name,
              hooks: analyzeFunction(code, node.declaration).hooks,
            });
          }
        } else if (node.declaration.type === "VariableDeclaration") {
          /**
           * export const foo = 1, bar = 2
           */
          if (node.declaration.kind === "const") {
            const start = node.declaration.start;
            outCode = replaceCode(outCode, start, start + 5, "let  ");
          }
          for (const decl of node.declaration.declarations) {
            if (
              decl.id.type === "Identifier" &&
              decl.init &&
              decl.init.type === "ArrowFunctionExpression" &&
              COMPONENT_RE.test(decl.id.name)
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

    /**
     * function foo() {}
     */
    if (
      node.type === "FunctionDeclaration" &&
      COMPONENT_RE.test(node.id.name)
    ) {
      entries.push({
        id: node.id.name,
        hooks: analyzeFunction(code, node).hooks,
      });
    }

    /**
     * const foo = 1, bar = 2
     */
    if (node.type === "VariableDeclaration") {
      if (node.kind === "const") {
        const start = node.start;
        outCode = replaceCode(outCode, start, start + 5, "let  ");
      }
      for (const decl of node.declarations) {
        // TODO: FunctionExpression
        if (
          decl.id.type === "Identifier" &&
          decl.init &&
          decl.init.type === "ArrowFunctionExpression" &&
          COMPONENT_RE.test(decl.id.name)
        ) {
          entries.push({
            id: decl.id.name,
            hooks: analyzeFunction(code, decl.init).hooks,
          });
        }
      }
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
  // we could do this runtime via `fn.toString()`,
  // but that will impact performance on each render.
  const bodyCode = code.slice(node.body.start, node.body.end);
  const matches = bodyCode.matchAll(HOOK_CALL_RE);
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
