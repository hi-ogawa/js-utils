import { Volume } from "memfs";
import { describe, expect, it } from "vitest";
import { run } from "./runner";

describe(run, () => {
  it("basic", async () => {
    // https://github.com/streamich/memfs/blob/master/docs/node/usage.md
    const volumeJson = {
      "f1.ts": `
import { x2 as y2 } from "./f2";
import "./dir1/f4";
import * as f5 from "./dir1/f5";
import process from "node:process";
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
    const result = await run(Object.keys(volumeJson), {
      fs: volume.promises as any,
    });
    expect(result.errors.length).toBe(0);
    expect(result.relations).toMatchInlineSnapshot(`
      [
        {
          "file": "f1.ts",
          "target": {
            "external": false,
            "source": "dir1/f4",
          },
          "usage": {
            "type": "sideEffect",
          },
        },
        {
          "file": "f1.ts",
          "target": {
            "external": false,
            "source": "f2",
          },
          "usage": {
            "name": "x2",
            "type": "named",
          },
        },
        {
          "file": "f1.ts",
          "target": {
            "external": true,
            "source": "node:process",
          },
          "usage": {
            "name": "default",
            "type": "named",
          },
        },
        {
          "file": "f1.ts",
          "target": {
            "external": false,
            "source": "dir1/f5",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "f2.tsx",
          "target": {
            "external": false,
            "source": "dir1/f3",
          },
          "usage": {
            "name": "x3",
            "type": "named",
          },
        },
        {
          "file": "dir1/f3.ts",
          "target": {
            "external": false,
            "source": "dir1",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir1/f3.ts",
          "target": {
            "external": false,
            "source": "dir1/",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir1/f3.ts",
          "target": {
            "external": false,
            "source": "dir1/index",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir2/dir3/f7.ts",
          "target": {
            "external": false,
            "source": "dir2/f5",
          },
          "usage": {
            "type": "namespace",
          },
        },
        {
          "file": "dir2/dir3/f7.ts",
          "target": {
            "external": false,
            "source": "dir2",
          },
          "usage": {
            "type": "namespace",
          },
        },
      ]
    `);
  });
});
