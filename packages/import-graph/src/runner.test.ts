import { Volume } from "memfs";
import { describe, expect, it } from "vitest";
import { run } from "./runner";

describe(run, () => {
  it("basic", async () => {
    // https://github.com/streamich/memfs/blob/master/docs/node/usage.md
    const volume = Volume.fromJSON({
      "f1.ts": `
import { x2 } from "./f2";
`,
      "f2.ts": `
import { x3 } from "./dir1/f3";
export const x2 = x3 + 1;
`,
      "dir1/f3.ts": `
export const x3 =  0;
`,
      "dir1/f4.ts": "",
      "dir2/f5.ts": "",
      "dir2/f6.ts": "",
      "dir2/dir3/f7.ts": "",
      "dir2/dir3/f8.ts": "",
    });
    const result = await run(["f1.ts", "f2.ts"], {
      fs: volume.promises as any,
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "entries": [
          {
            "file": "f1.ts",
            "parseOutput": {
              "bareImports": [],
              "namedExports": [],
              "namedImports": [
                {
                  "name": "x2",
                  "position": 10,
                  "source": "./f2",
                },
              ],
              "namedReExports": [],
              "namespaceImports": [],
              "namespaceReExports": [],
            },
          },
          {
            "file": "f2.ts",
            "parseOutput": {
              "bareImports": [],
              "namedExports": [
                {
                  "name": "x2",
                  "position": 46,
                },
              ],
              "namedImports": [
                {
                  "name": "x3",
                  "position": 10,
                  "source": "./dir1/f3",
                },
              ],
              "namedReExports": [],
              "namespaceImports": [],
              "namespaceReExports": [],
            },
          },
        ],
        "errors": [],
      }
    `);
  });
});
