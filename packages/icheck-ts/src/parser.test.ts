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
          "exports": [
            {
              "bindings": [
                {
                  "name": "f4",
                  "nameBefore": "f3",
                },
              ],
              "comment": "",
              "position": [
                14,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "default",
                },
              ],
              "comment": "// export other cases",
              "position": [
                17,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "f1",
                },
              ],
              "comment": "",
              "position": [
                18,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "default",
                },
              ],
              "comment": "",
              "position": [
                19,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "f3",
                },
              ],
              "comment": "",
              "position": [
                20,
                0,
              ],
            },
          ],
          "imports": [
            {
              "bindings": [
                {
                  "name": "d1",
                  "nameBefore": "default",
                },
              ],
              "comment": "// import declarations",
              "namespace": false,
              "position": [
                3,
                0,
              ],
              "reExport": false,
              "sideEffect": false,
              "source": "./dep1",
            },
            {
              "bindings": [
                {
                  "name": "d2",
                  "nameBefore": undefined,
                },
              ],
              "comment": "",
              "namespace": false,
              "position": [
                4,
                0,
              ],
              "reExport": false,
              "sideEffect": false,
              "source": "./dep2",
            },
            {
              "bindings": [
                {
                  "name": "d4",
                  "nameBefore": "d3",
                },
              ],
              "comment": "",
              "namespace": false,
              "position": [
                5,
                0,
              ],
              "reExport": false,
              "sideEffect": false,
              "source": "./dep3",
            },
            {
              "bindings": [
                {
                  "name": "d3_1",
                  "nameBefore": "default",
                },
              ],
              "comment": "",
              "namespace": false,
              "position": [
                6,
                0,
              ],
              "reExport": false,
              "sideEffect": false,
              "source": "./dep3-1",
            },
            {
              "bindings": [],
              "comment": "",
              "namespace": true,
              "position": [
                7,
                0,
              ],
              "reExport": false,
              "sideEffect": false,
              "source": "./dep4",
            },
            {
              "bindings": [
                {
                  "name": "r1",
                  "nameBefore": undefined,
                },
              ],
              "comment": "// export declarations",
              "namespace": false,
              "position": [
                10,
                0,
              ],
              "reExport": true,
              "sideEffect": false,
              "source": "./re-dep1",
            },
            {
              "bindings": [
                {
                  "name": "r3",
                  "nameBefore": "r2",
                },
              ],
              "comment": "",
              "namespace": false,
              "position": [
                11,
                0,
              ],
              "reExport": true,
              "sideEffect": false,
              "source": "./re-dep2",
            },
            {
              "bindings": [
                {
                  "name": "r2_1",
                  "nameBefore": "default",
                },
              ],
              "comment": "",
              "namespace": false,
              "position": [
                12,
                0,
              ],
              "reExport": true,
              "sideEffect": false,
              "source": "./re-dep2-1",
            },
            {
              "bindings": [],
              "comment": "",
              "namespace": true,
              "position": [
                13,
                0,
              ],
              "reExport": true,
              "sideEffect": false,
              "source": "./re-dep3",
            },
            {
              "bindings": [],
              "comment": "// more cases",
              "namespace": false,
              "position": [
                23,
                0,
              ],
              "reExport": false,
              "sideEffect": true,
              "source": "./dep5",
            },
          ],
        },
      }
    `);
  });

  it("ignore", () => {
    // https://astexplorer.net/
    const code = `
export const yes1 = 0;
// icheck-ignore
export const no1 = 0;

export function yes2() {};
/* icheck-ignore */
export function no2() {};

// icheck-ignore
export default {};
`;
    expect(parseImportExport({ code, jsx: false })).toMatchInlineSnapshot(`
      {
        "ok": true,
        "value": {
          "exports": [
            {
              "bindings": [
                {
                  "name": "yes1",
                },
              ],
              "comment": "",
              "position": [
                2,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "no1",
                },
              ],
              "comment": "// icheck-ignore",
              "position": [
                4,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "yes2",
                },
              ],
              "comment": "",
              "position": [
                6,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "no2",
                },
              ],
              "comment": "/* icheck-ignore */",
              "position": [
                8,
                0,
              ],
            },
            {
              "bindings": [
                {
                  "name": "default",
                },
              ],
              "comment": "// icheck-ignore",
              "position": [
                11,
                0,
              ],
            },
          ],
          "imports": [],
        },
      }
    `);
  });
});
