import { Volume } from "memfs";
import { describe, expect, it } from "vitest";
import { resolveImportSource, run } from "./runner";

describe("runner", () => {
  it("importRelations", async () => {
    // https://github.com/streamich/memfs/blob/master/docs/node/usage.md
    const volumeJson = {
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
    const volume = Volume.fromJSON(volumeJson);
    const result = run(Object.keys(volumeJson), {
      fs: volume as any,
    });
    expect(result.errors.length).toBe(0);
    expect(result.importUsages).toMatchInlineSnapshot(`
      Map {
        "dir1/f3.ts" => [
          {
            "type": "sideEffect",
          },
          {
            "name": "x3",
            "type": "named",
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
        "dir2/f5.ts" => [
          {
            "type": "namespace",
          },
          {
            "type": "namespace",
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
            "used": false,
          },
        ],
        "f2.tsx" => [
          {
            "name": "x2",
            "used": true,
          },
          {
            "name": "x4",
            "used": true,
          },
          {
            "name": "x4_1",
            "used": false,
          },
        ],
        "dir1/f3.ts" => [
          {
            "name": "x3",
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
              "name": "dir2/f5.ts",
              "type": "internal",
            },
            "usage": {
              "type": "namespace",
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
  it("relative", () => {
    const fs = Volume.fromJSON({
      "x.ts": "",
      "y.ts": "",
    });
    expect(resolveImportSource("x.ts", "./y", fs as any))
      .toMatchInlineSnapshot(`
      {
        "name": "y.ts",
        "type": "internal",
      }
    `);
  });
});
