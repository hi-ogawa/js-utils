import { sleep, tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { promptQuestion } from "./prompt";
import { $ } from "./script";

describe(promptQuestion, () => {
  it("basic", async () => {
    const proc = $`pnpm exec tsx ./src/fixtures/prompt-basic.ts`;
    tinyassert(proc.child.stdin);

    await retry(() => tinyassert(proc.stdout.includes("hello?")));
    expect(proc.stdout).toMatchInlineSnapshot(`"hello? "`);

    proc.child.stdin.end("hi\n");
    expect(await proc).toMatchInlineSnapshot(`"hello? answer: hi"`);
  });
});

async function retry<T>(f: () => T): Promise<Awaited<T>> {
  let error: unknown;
  for (const interval of [100, 250, 500, 1000]) {
    try {
      return await f();
    } catch (e) {
      error = e;
    }
    await sleep(interval);
  }
  throw error;
}
