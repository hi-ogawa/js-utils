import { beforeAll, describe, expect, it } from "vitest";
import { findCircularImport, resolveImportSource, runner } from "./runner";
import { setupTestFixture } from "./tests/helper";

describe(runner, () => {
  const fixture = {
    "f1.ts": `
import { x2 as y2, x4 } from "./f2";
export { x2 as z2 } from "./f2";
import * as f5 from "./dir2/f5";
import process from "node:process";
import "./dir1/f3";
import "./dir1/unknown";
import "./dir2/dir3";
`,

    "f2.tsx": `
import { x3 } from "./dir1/f3";
export const x2 = x3 + 1;
export const x4 = x3 + 2;
// icheck-ignore
export const x4_1 = x3 + 3;
`,

    "dir1/index.ts": "",

    "dir1/f3.ts": `
import * as i from ".";
import * as j from "./";
import * as k from "./index";
export const x3 =  0;
`,

    "dir2/index.tsx": "",
    "dir2/f5.ts": "",

    "dir2/dir3/f7.ts": `
import * as i from "../f5";
import * as j from "..";
`,
  };

  beforeAll(() => setupTestFixture("runner", fixture));

  it("basic", async () => {
    const result = await runner(Object.keys(fixture));
    expect(result.errors.size).toBe(0);
    expect(result.importUsages).toMatchInlineSnapshot(`
      Map {
        "f2.tsx" => [
          {
            "name": "x2",
            "type": "named",
          },
          {
            "name": "x4",
            "type": "named",
          },
          {
            "name": "x2",
            "type": "named",
          },
        ],
        "dir2/f5.ts" => [
          {
            "type": "namespace",
          },
          {
            "type": "namespace",
          },
        ],
        "dir1/f3.ts" => [
          {
            "type": "sideEffect",
          },
          {
            "name": "x3",
            "type": "named",
          },
        ],
        "dir1/index.ts" => [
          {
            "type": "namespace",
          },
          {
            "type": "namespace",
          },
          {
            "type": "namespace",
          },
        ],
        "dir2/index.tsx" => [
          {
            "type": "namespace",
          },
        ],
      }
    `);
    expect(result.exportUsages).toMatchInlineSnapshot(`
      Map {
        "f1.ts" => [
          {
            "comment": "",
            "name": "z2",
            "position": [
              3,
              0,
            ],
            "used": false,
          },
        ],
        "f2.tsx" => [
          {
            "comment": "",
            "name": "x2",
            "position": [
              3,
              0,
            ],
            "used": true,
          },
          {
            "comment": "",
            "name": "x4",
            "position": [
              4,
              0,
            ],
            "used": true,
          },
          {
            "comment": "// icheck-ignore",
            "name": "x4_1",
            "position": [
              6,
              0,
            ],
            "used": false,
          },
        ],
        "dir1/f3.ts" => [
          {
            "comment": "",
            "name": "x3",
            "position": [
              5,
              0,
            ],
            "used": true,
          },
        ],
      }
    `);
    expect(result.importRelations).toMatchInlineSnapshot(`
      Map {
        "f1.ts" => [
          {
            "source": {
              "name": "f2.tsx",
              "type": "internal",
            },
            "usage": {
              "name": "x2",
              "type": "named",
            },
          },
          {
            "source": {
              "name": "f2.tsx",
              "type": "internal",
            },
            "usage": {
              "name": "x4",
              "type": "named",
            },
          },
          {
            "source": {
              "name": "f2.tsx",
              "type": "internal",
            },
            "usage": {
              "name": "x2",
              "type": "named",
            },
          },
          {
            "source": {
              "name": "dir2/f5.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "source": {
              "name": "node:process",
              "type": "external",
            },
            "usage": {
              "name": "default",
              "type": "named",
            },
          },
          {
            "source": {
              "name": "dir1/f3.ts",
              "type": "internal",
            },
            "usage": {
              "type": "sideEffect",
            },
          },
          {
            "source": {
              "name": "./dir1/unknown",
              "type": "unknown",
            },
            "usage": {
              "type": "sideEffect",
            },
          },
          {
            "source": {
              "name": "./dir2/dir3",
              "type": "unknown",
            },
            "usage": {
              "type": "sideEffect",
            },
          },
        ],
        "f2.tsx" => [
          {
            "source": {
              "name": "dir1/f3.ts",
              "type": "internal",
            },
            "usage": {
              "name": "x3",
              "type": "named",
            },
          },
        ],
        "dir1/f3.ts" => [
          {
            "source": {
              "name": "dir1/index.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "source": {
              "name": "dir1/index.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "source": {
              "name": "dir1/index.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
        ],
        "dir2/dir3/f7.ts" => [
          {
            "source": {
              "name": "dir2/f5.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "source": {
              "name": "dir2/index.tsx",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
        ],
      }
    `);
  });
});

describe(resolveImportSource, () => {
  beforeAll(() =>
    setupTestFixture(resolveImportSource.name, {
      "x.ts": "",
      "y.ts": "",
    })
  );

  it("relative", async () => {
    expect(await resolveImportSource("x.ts", "./y")).toMatchInlineSnapshot(`
      {
        "name": "y.ts",
        "type": "internal",
      }
    `);
  });
});

describe(findCircularImport, () => {
  const fixture = {
    "x.ts": `
import y from "./y";
export const x = "x";
`,
    "y.ts": `
import "./z";
export default "y";
`,
    "z.ts": `
import { x } from "./x";
export default "z";
`,
  };

  beforeAll(() => setupTestFixture(findCircularImport.name, fixture));

  it("basic", async () => {
    const result = await runner(Object.keys(fixture));
    expect(findCircularImport(result.importRelations)).toMatchInlineSnapshot(`
      {
        "backEdges": [
          [
            "z.ts",
            {
              "source": {
                "name": "x.ts",
                "type": "internal",
              },
              "usage": {
                "name": "x",
                "type": "named",
              },
            },
          ],
        ],
        "parentMap": Map {
          "y.ts" => {
            "edge": {
              "source": {
                "name": "y.ts",
                "type": "internal",
              },
              "usage": {
                "name": "default",
                "type": "named",
              },
            },
            "parent": "x.ts",
          },
          "z.ts" => {
            "edge": {
              "source": {
                "name": "z.ts",
                "type": "internal",
              },
              "usage": {
                "type": "sideEffect",
              },
            },
            "parent": "y.ts",
          },
        },
      }
    `);
  });
});
