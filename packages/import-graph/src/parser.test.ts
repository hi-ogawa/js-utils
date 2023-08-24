import { describe, expect, it } from "vitest";
import { parseImportExport } from "./parser";

describe(parseImportExport, () => {
  it("basic", () => {
    // https://astexplorer.net/
    const code = `
// import declarations
import d1 from "./dep1";
import { d2 } from "./dep2";
import { d3 as d4 } from "./dep3";
import { default as d3_1 } from "./dep3-1";
import * as d5 from "./dep4";

// export declarations
export { r1 } from "./re-dep1";
export { r2 as r3 } from "./re-dep2";
export { default as r2_1 } from "./re-dep2-1";
export * from "./re-dep3";
export { f3 as f4 };

// export other cases
export default () => {};
export const f1 = () => {};
export default function f2() {};
export function f3() {};
`;
    expect(parseImportExport(code, "dummy.ts")).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "exportInfos": [
            {
              "name": "f4",
              "position": 364,
              "propertyName": "f3",
            },
            {
              "name": "default",
              "position": 399,
            },
            {
              "name": "f1",
              "position": 437,
            },
            {
              "name": "default",
              "position": 452,
            },
            {
              "name": "f3",
              "position": 485,
            },
          ],
          "importInfos": [
            {
              "position": 24,
              "reExport": false,
              "source": "./dep1",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "default",
                },
              ],
            },
            {
              "position": 49,
              "reExport": false,
              "source": "./dep2",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "d2",
                  "propertyName": undefined,
                },
              ],
            },
            {
              "position": 78,
              "reExport": false,
              "source": "./dep3",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "d4",
                  "propertyName": "d3",
                },
              ],
            },
            {
              "position": 113,
              "reExport": false,
              "source": "./dep3-1",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "d3_1",
                  "propertyName": "default",
                },
              ],
            },
            {
              "position": 157,
              "reExport": false,
              "source": "./dep4",
              "specifierStar": true,
              "specifiers": [],
            },
            {
              "position": 211,
              "reExport": true,
              "source": "./re-dep1",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "r1",
                  "propertyName": undefined,
                },
              ],
            },
            {
              "position": 243,
              "reExport": true,
              "source": "./re-dep2",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "r3",
                  "propertyName": "r2",
                },
              ],
            },
            {
              "position": 281,
              "reExport": true,
              "source": "./re-dep2-1",
              "specifierStar": false,
              "specifiers": [
                {
                  "name": "r2_1",
                  "propertyName": "default",
                },
              ],
            },
            {
              "position": 328,
              "reExport": true,
              "source": "./re-dep3",
              "specifierStar": true,
              "specifiers": [],
            },
          ],
        },
      }
    `);
  });
});
