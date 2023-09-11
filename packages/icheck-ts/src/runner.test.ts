import { beforeAll, describe, expect, it } from "vitest";
import {
  findCircularImport,
  formatCircularImportError,
  resolveImportSource,
  runner,
} from "./runner";
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
            "name": "z2",
            "node": {
              "comment": "",
              "position": [
                3,
                0,
              ],
            },
            "used": false,
          },
        ],
        "f2.tsx" => [
          {
            "name": "x2",
            "node": {
              "comment": "",
              "position": [
                3,
                0,
              ],
            },
            "used": true,
          },
          {
            "name": "x4",
            "node": {
              "comment": "",
              "position": [
                4,
                0,
              ],
            },
            "used": true,
          },
          {
            "name": "x4_1",
            "node": {
              "comment": "// icheck-ignore",
              "position": [
                6,
                0,
              ],
            },
            "used": false,
          },
        ],
        "dir1/f3.ts" => [
          {
            "name": "x3",
            "node": {
              "comment": "",
              "position": [
                5,
                0,
              ],
            },
            "used": true,
          },
        ],
      }
    `);
    expect(result.importRelations).toMatchInlineSnapshot(`
      Map {
        "f1.ts" => [
          {
            "node": {
              "comment": "",
              "position": [
                2,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                2,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                3,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                4,
                0,
              ],
            },
            "source": {
              "name": "dir2/f5.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "node": {
              "comment": "",
              "position": [
                5,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                6,
                0,
              ],
            },
            "source": {
              "name": "dir1/f3.ts",
              "type": "internal",
            },
            "usage": {
              "type": "sideEffect",
            },
          },
          {
            "node": {
              "comment": "",
              "position": [
                7,
                0,
              ],
            },
            "source": {
              "name": "./dir1/unknown",
              "type": "unknown",
            },
            "usage": {
              "type": "sideEffect",
            },
          },
          {
            "node": {
              "comment": "",
              "position": [
                8,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                2,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                2,
                0,
              ],
            },
            "source": {
              "name": "dir1/index.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "node": {
              "comment": "",
              "position": [
                3,
                0,
              ],
            },
            "source": {
              "name": "dir1/index.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "node": {
              "comment": "",
              "position": [
                4,
                0,
              ],
            },
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
            "node": {
              "comment": "",
              "position": [
                2,
                0,
              ],
            },
            "source": {
              "name": "dir2/f5.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
            },
          },
          {
            "node": {
              "comment": "",
              "position": [
                3,
                0,
              ],
            },
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
    const circularResult = findCircularImport(result.importRelations);
    expect(circularResult).toMatchInlineSnapshot(`
      {
        "backEdges": [
          [
            "z.ts",
            {
              "node": {
                "comment": "",
                "position": [
                  2,
                  0,
                ],
              },
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
          "y.ts" => [
            "x.ts",
            {
              "node": {
                "comment": "",
                "position": [
                  2,
                  0,
                ],
              },
              "source": {
                "name": "y.ts",
                "type": "internal",
              },
              "usage": {
                "name": "default",
                "type": "named",
              },
            },
          ],
          "z.ts" => [
            "y.ts",
            {
              "node": {
                "comment": "",
                "position": [
                  2,
                  0,
                ],
              },
              "source": {
                "name": "z.ts",
                "type": "internal",
              },
              "usage": {
                "type": "sideEffect",
              },
            },
          ],
        },
      }
    `);

    const cycle = formatCircularImportError(
      circularResult.backEdges[0],
      circularResult.parentMap
    );
    expect(cycle).toMatchInlineSnapshot(`
      {
        "cycle": [
          [
            "x.ts",
            {
              "node": {
                "comment": "",
                "position": [
                  2,
                  0,
                ],
              },
              "source": {
                "name": "y.ts",
                "type": "internal",
              },
              "usage": {
                "name": "default",
                "type": "named",
              },
            },
          ],
          [
            "y.ts",
            {
              "node": {
                "comment": "",
                "position": [
                  2,
                  0,
                ],
              },
              "source": {
                "name": "z.ts",
                "type": "internal",
              },
              "usage": {
                "type": "sideEffect",
              },
            },
          ],
          [
            "z.ts",
            {
              "node": {
                "comment": "",
                "position": [
                  2,
                  0,
                ],
              },
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
        "lines": [
          "x.ts:2 - default",
          "y.ts:2 - (side effect)",
          "z.ts:2 - x",
        ],
      }
    `);
  });
});
