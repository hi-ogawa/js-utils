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
      _: {
        noTrim: true,
        verbose: true,
        log: logFn,
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

  describe("ChildProcess", () => {
    it("basic", async () => {
      const proc = $`node -e 'console.log("abc"); console.error("def")'`;
      expect(await proc.promise).toMatchInlineSnapshot('"abc"');
      expect(proc.stdout).toMatchInlineSnapshot(`
        "abc
        "
      `);
      expect(proc.stderr).toMatchInlineSnapshot(`
        "def
        "
      `);
      expect(proc.child.exitCode).toMatchInlineSnapshot("0");
    });

    it("stdin", async () => {
      const proc = $`node -`;
      tinyassert(proc.child.stdin);
      proc.child.stdin.end("console.log(1 + 1)");
      expect(await proc.promise).toMatchInlineSnapshot('"2"');
    });
  });
});
