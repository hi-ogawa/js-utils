import type { Readable } from "stream";
import { createManualPromise, debounce, tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { promptAutocomplete, promptQuestion } from "./prompt";
import { stripAnsi } from "./prompt-utils";
import { $ } from "./script";

describe(promptQuestion, () => {
  it("basic", async () => {
    const proc = $`pnpm exec tsx ./src/fixtures/prompt-basic.ts`;
    tinyassert(proc.child.stdin);
    tinyassert(proc.child.stdout);

    await waitForStable(proc.child.stdout);
    expect(proc.stdout).toMatchInlineSnapshot(`"hello? "`);

    proc.child.stdin.write("hi\n");
    expect(await proc).toMatchInlineSnapshot(`"hello? answer: hi"`);
  });
});

describe(promptAutocomplete, () => {
  it("basic", async () => {
    const proc = $`pnpm exec tsx ./src/fixtures/prompt-autocomplete.ts`;
    tinyassert(proc.child.stdin);
    tinyassert(proc.child.stdout);

    await waitForStable(proc.child.stdout);
    expect(stripSnap(proc.stdout)).toMatchInlineSnapshot(`
      "? select node builtin module >
      "
    `);

    // TODO: why suggestions not showing up?

    proc.child.stdin.write("promises");
    await waitForStable(proc.child.stdout);
    expect(stripSnap(proc.stdout)).toMatchInlineSnapshot(`
      "? select node builtin module >
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      "
    `);

    proc.child.stdin.write("\n");
    await waitForStable(proc.child.stdout);
    expect(stripSnap(proc.stdout)).toMatchInlineSnapshot(`
      "? select node builtin module >
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      ? select node builtin module > promises
      [answer] { input: 'promises', value: 'dns/promises' }
      "
    `);
  });
});

async function waitForStable(readable: Readable, ms: number = 200) {
  const manual = createManualPromise<void>();
  const resolve = debounce(() => manual.resolve(), ms);
  readable.on("data", resolve);
  try {
    await manual;
  } finally {
    readable.off("data", resolve);
  }
}

function stripSnap(v: string) {
  v = stripAnsi(v);
  v = v.replaceAll(/ *$/gm, ""); // strip trailing line
  return v;
}
