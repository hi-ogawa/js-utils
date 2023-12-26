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
    expect(cleanOutput(proc.stdout)).toMatchInlineSnapshot(`
      "* Select node builtin module >
        > _http_agent
          _http_client
          _http_common
          _http_incoming
          _http_outgoing
          _http_server
          _stream_duplex
          _stream_passthrough
          _stream_readable
          _stream_transform
        [1/66]
      "
    `);

    const marker = "Select node builtin module";
    proc.child.stdin.write("promises");
    await waitForStable(proc.child.stdout);
    expect(getLinesFromLastMarker(cleanOutput(proc.stdout), marker))
      .toMatchInlineSnapshot(`
        "* Select node builtin module > promises
          > dns/promises
            fs/promises
            readline/promises
            stream/promises
            timers/promises
          [1/5]
        "
      `);

    proc.child.stdin.write("\x1b[B".repeat(2));
    await waitForStable(proc.child.stdout);
    expect(getLinesFromLastMarker(cleanOutput(proc.stdout), marker))
      .toMatchInlineSnapshot(`
        "* Select node builtin module > promises
            dns/promises
            fs/promises
          > readline/promises
            stream/promises
            timers/promises
          [3/5]
        "
      `);

    proc.child.stdin.write("\n");
    await waitForStable(proc.child.stdout);
    expect(getLinesFromLastMarker(cleanOutput(proc.stdout), marker))
      .toMatchInlineSnapshot(`
        "o Select node builtin module > readline/promises
        [answer] { input: 'promises', value: 'readline/promises' }
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

function cleanOutput(v: string) {
  v = stripAnsi(v);
  v = v.replaceAll(/ *$/gm, ""); // strip trailing line
  return v;
}

function getLinesFromLastMarker(s: string, marker: string): string {
  const i = s.lastIndexOf(marker);
  if (i >= 0) {
    const j = s.slice(0, i).lastIndexOf("\n");
    return s.slice(j + 1);
  }
  return s;
}
