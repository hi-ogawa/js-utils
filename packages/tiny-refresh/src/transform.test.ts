import { describe, expect, it } from "vitest";
import { hmrTransform, hmrTransform2 } from "./transform";

describe(hmrTransform, () => {
  it("basic", async () => {
    const input = `\
export default function CompFn() {
  return "hello";
}

export let CompLet = () => {
  useState();
  useEffect;
  useRef();
  // useCallback();
  return "hello";
}

export const CompConst = () => {
  return "hello";
}
`;
    expect(
      await hmrTransform2(input, {
        runtime: "react",
        bundler: "vite",
      })
    ).toMatchInlineSnapshot(`
      "export default function CompFn() {
        return "hello";
      }

      export let CompLet = () => {
        useState();
        useEffect;
        useRef();
        // useCallback();
        return "hello";
      }

      export let   CompConst = () => {
        return "hello";
      }

      import * as $$runtime from "react";
      import * as $$refresh from "react";
      const $$registry = $$refresh.createHmrRegistry(
        {
          createElement: $$runtime.createElement,
          useReducer: $$runtime.useReducer,
          useEffect: $$runtime.useEffect,
        },
        false,
      );

      if (typeof CompFn === "function" && CompFn.length <= 1) {
        CompFn = $$refresh.createHmrComponent(
          $$registry, "CompFn", CompFn,
          { key: "", remount: false }
        );
      }

      if (typeof CompLet === "function" && CompLet.length <= 1) {
        CompLet = $$refresh.createHmrComponent(
          $$registry, "CompLet", CompLet,
          { key: "useState/useRef", remount: false }
        );
      }

      if (typeof CompConst === "function" && CompConst.length <= 1) {
        CompConst = $$refresh.createHmrComponent(
          $$registry, "CompConst", CompConst,
          { key: "", remount: false }
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
