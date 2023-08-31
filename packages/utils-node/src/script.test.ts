import { tinyassert, wrapErrorAsync } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { $ } from "./script";

describe("script", () => {
  it("basic", async () => {
    const output = await $`echo ${"hello"} ${"world"}`;
    expect(output).toMatchInlineSnapshot('"hello world"');
  });

  it("new", async () => {
    const logFn = vi.fn();
    const $$ = $.new({
      _: {
        noTrim: true,
        verbose: true,
        log: (v) => logFn(v.replace(/^\[\d{2}:\d{2}:\d{2}.\d{3}\]/, "[...]")), // reduct non-deterministic timestamp
      },
    });
    const output = await $$`echo ${"hello"} ${"world"}`;
    expect(output).toMatchInlineSnapshot(`
      "hello world
      "
    `);
    expect(logFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[...] echo hello world",
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
          "command": "node --yelp",
          "exitCode": 9,
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
      await proc.closed;
      expect(proc.stdout).toMatchInlineSnapshot('"abc"');
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
      await proc.closed;
      expect(proc.stdout).toMatchInlineSnapshot('"2"');
      expect(proc.child.exitCode).toMatchInlineSnapshot("0");
    });
  });
});
