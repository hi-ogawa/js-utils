import childProcess from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import { setupTestFixture } from "./tests/helper";

describe("cli", () => {
  const fixture = {
    "x1.ts": `
import { used } from "./x2";
import * as z from "./x3";
`,
    "x2.ts": `
export const used = 0;
export const unused = 0;
// icheck-ignore
export const unusedIgnored = 0;
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
      fixtures/cli/x2.ts:3 - unused
      ** Circular imports **
      fixtures/cli/cycle4.ts:2 - x
       -> fixtures/cli/cycle2.ts:2 - (side effect)
           -> fixtures/cli/cycle3.ts:2 - *
      "
    `);
  });
});
