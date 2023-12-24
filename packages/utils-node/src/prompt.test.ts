import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { promptQuestion } from "./prompt";
import { $ } from "./script";

describe(promptQuestion, () => {
  it("basic", async () => {
    const proc = $`pnpm exec tsx ./src/fixtures/prompt-basic.ts`;
    tinyassert(proc.child.stdin);
    proc.child.stdin.end("hi\n");
    expect(await proc.promise).toMatchInlineSnapshot(`"hello? answer: hi"`);
  });
});
