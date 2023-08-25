import { Volume } from "memfs";
import { describe, expect, it } from "vitest";
import { run } from "./runner";

describe(run, () => {
  it("basic", async () => {
    // https://github.com/streamich/memfs/blob/master/docs/node/usage.md
    const volume = Volume.fromJSON({
      "f1.ts": ``,
      "f2.ts": "",
      "dir1/f3.ts": "",
      "dir1/f4.ts": "",
      "dir2/f5.ts": "",
      "dir2/f6.ts": "",
      "dir2/dir3/f7.ts": "",
      "dir2/dir3/f8.ts": "",
    });
    const result = await run(["f1.ts"], { fs: volume.promises as any });
    expect(result).toMatchInlineSnapshot(`
      {
        "entries": [
          {
            "file": "f1.ts",
            "parseOutput": {
              "namedExports": [],
              "namedImports": [],
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
