import { tinyassert, wrapErrorAsync } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { $, $new } from "./script";

describe("script", () => {
  it("basic", async () => {
    const output = await $`echo ${"hello"} ${"world"}`;
    expect(output).toMatchInlineSnapshot('"hello world"');
  });

  it("helperOptions", async () => {
    const logFn = vi.fn();
    const $ = $new({
      $: {
        noTrim: true,
        verbose: true,
        consoleLog: logFn,
      },
    });
    const output = await $`echo ${"hello"} ${"world"}`;
    expect(output).toMatchInlineSnapshot(`
      "hello world
      "
    `);
    expect(logFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "$ echo hello world",
        ],
      ]
    `);
  });

  describe("error", () => {
    it("command status", async () => {
      const result = await wrapErrorAsync(async () => await $`node --yelp`);
      expect(result).toMatchInlineSnapshot(`
        {
          "ok": false,
          "value": [Error: ScriptError],
        }
      `);
      tinyassert(!result.ok);
      tinyassert(result.value instanceof Error);
      expect(result.value.cause).toMatchInlineSnapshot(`
        {
          "code": 9,
          "command": "node --yelp",
          "stderr": "node: bad option: --yelp
        ",
          "stdout": "",
        }
      `);
    });
  });

  it("ChildProcess", async () => {
    const spawned = $`node -e 'console.log("abc"); console.error("def")'`;
    expect(await spawned.promise).toMatchInlineSnapshot('"abc"');
    expect(spawned.stdout).toMatchInlineSnapshot(`
      "abc
      "
    `);
    expect(spawned.stderr).toMatchInlineSnapshot(`
      "def
      "
    `);
    expect(spawned.child.exitCode).toMatchInlineSnapshot("0");
  });
});