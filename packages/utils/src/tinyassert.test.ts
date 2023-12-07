import process from "node:process";
import { assert, describe, expect, it } from "vitest";
import { tinyassert } from "./tinyassert";

describe(tinyassert, () => {
  it("error stacktrace snapshot", () => {
    function boom() {
      tinyassert(false);
    }
    try {
      boom();
      assert(false, "unreachable");
    } catch (e) {
      assert(e instanceof Error);
      assert(e.stack);
      const stack = e.stack
        .split("\n")
        .slice(0, 3)
        .join("\n")
        .replaceAll(process.cwd(), "__CWD__");
      expect(stack).toMatchInlineSnapshot(`
        "Error: 
            at boom (__CWD__/src/tinyassert.test.ts:8:7)
            at __CWD__/src/tinyassert.test.ts:11:7"
      `);
    }
  });

  it.fails("error stacktrace vitest", () => {
    function boom() {
      tinyassert(false);
    }
    boom();
    // vitest stacktrace
    //   Error:
    //   ❯ boom packages/utils/src/index.test.ts:19:7
    //       17|   it("error stacktrace", () => {
    //       18|     function boom() {
    //       19|       tinyassert(false);
    //         |       ^
    //       20|     }
    //       21|     boom();
    //   ❯ packages/utils/src/index.test.ts:21:5
  });

  it("type guard", () => {
    const maybeNumber = 1 as number | null | undefined;
    tinyassert(maybeNumber);
    maybeNumber satisfies number;
  });

  it("error without message", () => {
    expect(() => tinyassert(false)).toThrowErrorMatchingInlineSnapshot(
      `[Error]`
    );
  });

  it("error with message", () => {
    expect(() => tinyassert(false, "boom")).toThrowErrorMatchingInlineSnapshot(
      `[Error: boom]`
    );
  });
});
