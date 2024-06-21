import { describe, expect, it } from "vitest";
import { transformVite } from "./transform";

describe(transformVite, () => {
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
      await transformVite(input, {
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
      if (import.meta.hot) {
        () => import.meta.hot.accept(); // need a fake "accept" for Vite to notice
        const $$manager = $$refresh.setupVite(
          import.meta.hot,
          $$runtime,
          false
        );
        FnDefault = $$manager.wrap("FnDefault", FnDefault, "");
        FnLet = $$manager.wrap("FnLet", FnLet, "useState/useRef/useCallback");
        FnConst = $$manager.wrap("FnConst", FnConst, "");
        FnNonExport = $$manager.wrap("FnNonExport", FnNonExport, "");
      }"
    `);
  });
});
