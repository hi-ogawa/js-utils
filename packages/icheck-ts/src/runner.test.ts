import { beforeAll, describe, expect, it } from "vitest";
import {
  findCircularImport,
  formatCircularImportError,
  resolveImportSource,
  runner,
} from "./runner";
import { collectFiles, useChdir } from "./test/helper";

describe(runner, () => {
  beforeAll(() => useChdir("./fixtures/runner"));

  it("basic", async () => {
    const files = await collectFiles(".");
    const result = await runner(files);
    expect(result.errors.size).toBe(0);
    expect(result.importUsages).toMatchInlineSnapshot(`
      Map {
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
        "dir2/f5.ts" => [
          {
            "type": "namespace",
          },
          {
            "type": "namespace",
          },
        ],
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
        "dir1/f3.ts" => [
          {
            "type": "sideEffect",
          },
          {
            "name": "x3",
            "type": "named",
          },
        ],
      }
    `);
    expect(result.exportUsages).toMatchInlineSnapshot(`
      Map {
        "dir1/f3.ts" => [
          {
            "name": "x3",
            "node": {
              "comment": "",
              "position": [
                4,
                0,
              ],
            },
            "used": true,
          },
        ],
        "f1.ts" => [
          {
            "name": "z2",
            "node": {
              "comment": "",
              "position": [
                2,
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
                2,
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
                3,
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
                5,
                0,
              ],
            },
            "used": false,
          },
        ],
      }
    `);
    expect(result.importRelations).toMatchInlineSnapshot(`
      Map {
        "dir1/f3.ts" => [
          {
            "node": {
              "comment": "",
              "position": [
                1,
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
        ],
        "dir2/dir3/f7.ts" => [
          {
            "node": {
              "comment": "",
              "position": [
                1,
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
        ],
        "f1.ts" => [
          {
            "node": {
              "comment": "",
              "position": [
                1,
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
                1,
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
                3,
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
                4,
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
                5,
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
          {
            "node": {
              "comment": "",
              "position": [
                6,
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
                7,
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
        ],
        "f2.tsx" => [
          {
            "node": {
              "comment": "",
              "position": [
                1,
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
      }
    `);
  });
});

describe(resolveImportSource, () => {
  beforeAll(() => useChdir("./fixtures/resolveImportSource"));

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
  beforeAll(() => useChdir("./fixtures/findCircularImport"));

  it("basic", async () => {
    const files = await collectFiles(".");
    const result = await runner(files);
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
        ],
        "lines": [
          "z.ts:2 - x",
          "x.ts:2 - default",
          "y.ts:2 - (side effect)",
        ],
      }
    `);
  });
});
