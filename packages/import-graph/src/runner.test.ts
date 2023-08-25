import { Volume } from "memfs";
import { describe, expect, it } from "vitest";
import { run } from "./runner";

describe(run, () => {
  it("basic", async () => {
    // https://github.com/streamich/memfs/blob/master/docs/node/usage.md
    const volumeJson = {
      "f1.ts": `
import { x2 as y2 } from "./f2";
import * as f5 from "./dir2/f5";
import process from "node:process";
import "./dir1/f3";
import "./dir1/unknown";
`,

      "f2.tsx": `
import { x3 } from "./dir1/f3";
export const x2 = x3 + 1;
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
    expect(result.relations).toMatchInlineSnapshot(`
      [
        {
          "file": "f1.ts",
          "moduleSource": {
            "source": "dir1/f3.ts",
            "type": "internal",
          },
          "usage": {
            "type": "sideEffect",
          },
        },
        {
          "file": "f1.ts",
          "moduleSource": {
            "source": "dir1/unknown",
            "type": "unknown",
          },
          "usage": {
            "type": "sideEffect",
          },
        },
        {
          "file": "f1.ts",
          "moduleSource": {
            "source": "f2.tsx",
            "type": "internal",
          },
          "usage": {
            "name": "x2",
            "type": "named",
          },
        },
        {
          "file": "f1.ts",
          "moduleSource": {
            "source": "node:process",
            "type": "external",
          },
          "usage": {
            "name": "default",
            "type": "named",
          },
        },
        {
          "file": "f1.ts",
          "moduleSource": {
            "source": "dir2/f5.ts",
            "type": "internal",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "f2.tsx",
          "moduleSource": {
            "source": "dir1/f3.ts",
            "type": "internal",
          },
          "usage": {
            "name": "x3",
            "type": "named",
          },
        },
        {
          "file": "dir1/f3.ts",
          "moduleSource": {
            "source": "dir1/index.ts",
            "type": "internal",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir1/f3.ts",
          "moduleSource": {
            "source": "dir1/index.ts",
            "type": "internal",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir1/f3.ts",
          "moduleSource": {
            "source": "dir1/index.ts",
            "type": "internal",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir2/dir3/f7.ts",
          "moduleSource": {
            "source": "dir2/f5.ts",
            "type": "internal",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir2/dir3/f7.ts",
          "moduleSource": {
            "source": "dir2/index.tsx",
            "type": "internal",
          },
          "usage": {
            "type": "namespace",
          },
        },
      ]
    `);
  });
});
