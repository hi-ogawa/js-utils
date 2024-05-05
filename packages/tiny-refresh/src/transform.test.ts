import { describe, expect, it } from "vitest";
import { hmrTransform } from "./transform";

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

const CompInternal = () => {
  return "hello";
}
`;
    expect(
      await hmrTransform(input, {
        runtime: "/runtime",
        refreshRuntime: "/refresh-runtime",
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

      let   CompInternal = () => {
        return "hello";
      }

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

      if (import.meta.hot && typeof CompFn === "function") {
        CompFn = $$refresh.createHmrComponent(
          $$registry, "CompFn", CompFn,
          { key: "" },
          import.meta.hot,
        );
      }

      if (import.meta.hot && typeof CompLet === "function") {
        CompLet = $$refresh.createHmrComponent(
          $$registry, "CompLet", CompLet,
          { key: "useState/useRef/useCallback" },
          import.meta.hot,
        );
      }

      if (import.meta.hot && typeof CompConst === "function") {
        CompConst = $$refresh.createHmrComponent(
          $$registry, "CompConst", CompConst,
          { key: "" },
          import.meta.hot,
        );
      }

      if (import.meta.hot && typeof CompInternal === "function") {
        CompInternal = $$refresh.createHmrComponent(
          $$registry, "CompInternal", CompInternal,
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
