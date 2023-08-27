import { describe, expect, it, vi } from "vitest";
import { $, newScriptHelper } from "./script";

describe(newScriptHelper, () => {
  it("basic", async () => {
    const output = await $`echo hello`;
    expect(output).toMatchInlineSnapshot('"hello"');
  });

  it("helperOptions", async () => {
    const logFn = vi.fn();
    const $ = newScriptHelper({
      helper: { noTrim: true, verbose: true, log: logFn },
    });
    const output = await $`echo hello`;
    expect(output).toMatchInlineSnapshot(`
      "hello
      "
    `);
    expect(logFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "$ echo hello",
        ],
      ]
    `);
  });
});
