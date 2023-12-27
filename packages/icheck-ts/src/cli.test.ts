import childProcess from "node:child_process";
import { $ } from "@hiogawa/utils-node";
import { beforeAll, describe, expect, it } from "vitest";
import { setupTestFixture } from "./tests/helper";

describe("cli", () => {
  const fixture = {
    "x1.ts": `
import { a } from "./x2";
import * as z from "./x3";
`,
    "x2.ts": `
export const a = 0;
export const b = 0;
// icheck-ignore
export const c = 0;
`,
    "x3.ts": `
export const a = 0;
export const b = 0;
`,
    "cycle1.ts": `
import "./cycle2";
`,
    "cycle2.ts": `
import "./cycle3";
export const x = 0;
    `,
    "cycle3.ts": `
import * as x from "./cycle4";
`,
    "cycle4.ts": `
import { x } from "./cycle2";
`,
  };

  beforeAll(() => setupTestFixture("cli", fixture, { noChdir: true }));

  it("basic", () => {
    const res = childProcess.spawnSync(
      [
        "tsx ./src/cli.ts",
        ...Object.keys(fixture).map((k) => `fixtures/cli/${k}`),
      ].join(" "),
      { encoding: "utf-8", shell: true, stdio: "pipe" }
    );
    expect(res.stdout).toMatchInlineSnapshot(`
      "** Unused exports **
      fixtures/cli/x2.ts:3 - b
      ** Circular imports **
      fixtures/cli/cycle4.ts:2 - x
       -> fixtures/cli/cycle2.ts:2 - (side effect)
           -> fixtures/cli/cycle3.ts:2 - *
      "
    `);
  });
});

describe("import.meta.resolve", () => {
  it("tsx", async () => {
    let files = await $`find fixtures/resolve -type f`;
    files = files.replaceAll("\n", " ");
    const proc = $`tsx --experimental-import-meta-resolve ./src/cli.ts --useImportMetaResolve ${files}`;
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

  it.skip("TODO: test without tsx loader", async () => {});
});
