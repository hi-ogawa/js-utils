import { $ } from "@hiogawa/utils-node";
import { describe, expect, it } from "vitest";
import { collectFiles } from "./test/helper";

async function collectFilesJoin(dir: string) {
  const files = await collectFiles(dir);
  return files.join(" ");
}

describe("cli", () => {
  it("basic", async () => {
    const files = await collectFilesJoin("fixtures/cli");
    const proc = $`pnpm -s cli-tsx-dev ${files}`;
    await expect(proc).rejects.toMatchInlineSnapshot(`[Error: ScriptError]`);
    expect(proc.stdout).toMatchInlineSnapshot(`
      "** Unused exports **
      fixtures/cli/x2.ts:2 - b
      ** Circular imports **
      fixtures/cli/cycle4.ts:1 - x
       -> fixtures/cli/cycle2.ts:1 - (side effect)
           -> fixtures/cli/cycle3.ts:1 - *
      "
    `);
    expect(proc.stderr).toMatchInlineSnapshot(`""`);
  });
});

describe("import.meta.resolve", () => {
  it("cli-tsx-dev", async () => {
    const files = await collectFilesJoin("fixtures/resolve");
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
    const files = await collectFilesJoin("fixtures/resolve");
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
    const files = await collectFilesJoin("fixtures/resolve");
    const proc = $`pnpm -s cli --useImportMetaResolve ${files}`;
    await expect(proc).rejects.toMatchInlineSnapshot(`[Error: ScriptError]`);
    expect(proc.stdout).toMatchInlineSnapshot(`
      "** Unresolved imports **
      fixtures/resolve/dir1/f.ts:3 - ./index
      fixtures/resolve/f1.ts:2 - unknown-dep
      fixtures/resolve/f1.ts:4 - ./dir1/f
      fixtures/resolve/f1.ts:5 - ./dir1/unknown
      fixtures/resolve/f1.ts:6 - ./f2
      fixtures/resolve/f1.ts:7 - ./f3
      fixtures/resolve/f1.ts:8 - ./unknown
      "
    `);
    expect(proc.stderr).toMatchInlineSnapshot(`""`);
  });
});
