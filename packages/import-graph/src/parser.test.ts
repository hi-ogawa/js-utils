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

// more cases
import "./dep5";
`;
    expect(parseImportExport({ code, jsx: false })).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "bareImports": [
            {
              "position": 525,
              "source": "./dep5",
            },
          ],
          "namedExports": [
            {
              "name": "f3",
              "position": 364,
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
          "namedImports": [
            {
              "name": "default",
              "position": 31,
              "source": "./dep1",
            },
            {
              "name": "d2",
              "position": 58,
              "source": "./dep2",
            },
            {
              "name": "d3",
              "position": 87,
              "source": "./dep3",
            },
            {
              "name": "default",
              "position": 122,
              "source": "./dep3-1",
            },
          ],
          "namedReExports": [
            {
              "name": "r1",
              "nameBefore": undefined,
              "position": 220,
              "source": "./re-dep1",
            },
            {
              "name": "r3",
              "nameBefore": "r2",
              "position": 252,
              "source": "./re-dep2",
            },
            {
              "name": "r2_1",
              "nameBefore": "default",
              "position": 290,
              "source": "./re-dep2-1",
            },
          ],
          "namespaceImports": [
            {
              "position": 164,
              "source": "./dep4",
            },
          ],
          "namespaceReExports": [
            {
              "position": 328,
              "source": "./re-dep3",
            },
          ],
        },
      }
    `);
  });
});
