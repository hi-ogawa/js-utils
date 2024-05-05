import { describe, expect, it } from "vitest";
import { hmrTransform } from "./transform";

describe(hmrTransform, () => {
  it("basic", async () => {
    const input = /* js */ `\

export default function FnDefault() {}

export let FnLet = () => {
  useState();
  useEffect;
  useRef();
  // useCallback();
  return "hello";
}

export const FnConst = () => {}

const FnNonExport = () => {}

function notCapitalFn() {}

const NotFn = "hello";

// TODO
// export const FnExpr = function() {}
// export const NotFn2 = "hello";
`;
    expect(
      await hmrTransform(input, {
        runtime: "/runtime",
        refreshRuntime: "/refresh-runtime",
      })
    ).toMatchInlineSnapshot(`
      "
      export default function FnDefault() {}

      export let FnLet = () => {
        useState();
        useEffect;
        useRef();
        // useCallback();
        return "hello";
      }

      export let   FnConst = () => {}

      let   FnNonExport = () => {}

      function notCapitalFn() {}

      let   NotFn = "hello";

      // TODO
      // export const FnExpr = function() {}
      // export const NotFn2 = "hello";

      import * as $$runtime from "/runtime";
      import * as $$refresh from "/refresh-runtime";
      const $$registry = $$refresh.createHmrRegistry(
        {
          createElement: $$runtime.createElement,
          useReducer: $$runtime.useReducer,
          useEffect: $$runtime.useEffect,
        },
        false,
      );

      if (import.meta.hot && typeof FnDefault === "function") {
        FnDefault = $$refresh.createHmrComponent(
          $$registry, "FnDefault", FnDefault,
          { key: "" },
          import.meta.hot,
        );
      }

      if (import.meta.hot && typeof FnLet === "function") {
        FnLet = $$refresh.createHmrComponent(
          $$registry, "FnLet", FnLet,
          { key: "useState/useRef/useCallback" },
          import.meta.hot,
        );
      }

      if (import.meta.hot && typeof FnConst === "function") {
        FnConst = $$refresh.createHmrComponent(
          $$registry, "FnConst", FnConst,
          { key: "" },
          import.meta.hot,
        );
      }

      if (import.meta.hot && typeof FnNonExport === "function") {
        FnNonExport = $$refresh.createHmrComponent(
          $$registry, "FnNonExport", FnNonExport,
          { key: "" },
          import.meta.hot,
        );
      }

      if (import.meta.hot) {
        $$refresh.setupHmrVite(import.meta.hot, $$registry);
        () => import.meta.hot.accept();
      }
      "
    `);
  });
});
