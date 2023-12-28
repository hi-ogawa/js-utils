import { $ } from "@hiogawa/utils-node";
import { beforeAll, describe, expect, it } from "vitest";

describe("cli", () => {
  let files: string;
  beforeAll(async () => {
    files = await $`find fixtures/cli -type f`;
    files = files.replaceAll("\n", " ");
  });

  it("basic", async () => {
    const proc = $`pnpm -s cli-tsx-dev ${files}`;
    await expect(proc).rejects.toMatchInlineSnapshot(`[Error: ScriptError]`);
    expect(proc.stdout).toMatchInlineSnapshot(`
      "** Unused exports **
      fixtures/cli/x2.ts:2 - b
      ** Circular imports **
      fixtures/cli/cycle2.ts:1 - (side effect)
       -> fixtures/cli/cycle3.ts:1 - *
           -> fixtures/cli/cycle4.ts:1 - x
      "
    `);
    expect(proc.stderr).toMatchInlineSnapshot(`""`);
  });
});

describe("import.meta.resolve", () => {
  let files: string;
  beforeAll(async () => {
    files = await $`find fixtures/resolve -type f`;
    files = files.replaceAll("\n", " ");
  });

  it("cli-tsx-dev", async () => {
    const proc = $`pnpm -s cli-tsx-dev --useImportMetaResolve ${files}`;
    await expect(proc).rejects.toMatchInlineSnapshot(`[Error: ScriptError]`);
    expect(proc.stdout).toMatchInlineSnapshot(`
      "** Unresolved imports **
      fixtures/resolve/f1.ts:2 - unknown-dep
      fixtures/resolve/f1.ts:5 - ./dir1/unknown
      fixtures/resolve/f1.ts:8 - ./unknown
      "
    `);
    expect(proc.stderr).toMatchInlineSnapshot(`""`);
  });

  it("cli-tsx", async () => {
    const proc = $`pnpm -s cli-tsx --useImportMetaResolve ${files}`;
    await expect(proc).rejects.toMatchInlineSnapshot(`[Error: ScriptError]`);
    expect(proc.stdout).toMatchInlineSnapshot(`
      "** Unresolved imports **
      fixtures/resolve/f1.ts:2 - unknown-dep
      fixtures/resolve/f1.ts:5 - ./dir1/unknown
      fixtures/resolve/f1.ts:8 - ./unknown
      "
    `);
    expect(proc.stderr).toMatchInlineSnapshot(`""`);
  });

  it("cli", async () => {
    const proc = $`pnpm -s cli --useImportMetaResolve ${files}`;
    await expect(proc).rejects.toMatchInlineSnapshot(`[Error: ScriptError]`);
    expect(proc.stdout).toMatchInlineSnapshot(`
      "** Unresolved imports **
      fixtures/resolve/f1.ts:2 - unknown-dep
      fixtures/resolve/f1.ts:4 - ./dir1/f
      fixtures/resolve/f1.ts:5 - ./dir1/unknown
      fixtures/resolve/f1.ts:6 - ./f2
      fixtures/resolve/f1.ts:7 - ./f3
      fixtures/resolve/f1.ts:8 - ./unknown
      fixtures/resolve/dir1/f.ts:3 - ./index
      "
    `);
    expect(proc.stderr).toMatchInlineSnapshot(`""`);
  });
});
