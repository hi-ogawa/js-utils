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
              "comment": "
      ",
              "elements": [
                {
                  "name": "f4",
                  "propertyName": "f3",
                },
              ],
              "position": [
                14,
                0,
              ],
            },
            {
              "comment": "

      // export other cases
      ",
              "elements": [
                {
                  "name": "default",
                },
              ],
              "position": [
                17,
                0,
              ],
            },
            {
              "comment": "
      ",
              "elements": [
                {
                  "name": "f1",
                },
              ],
              "position": [
                18,
                0,
              ],
            },
            {
              "comment": "
      ",
              "elements": [
                {
                  "name": "default",
                },
              ],
              "position": [
                19,
                0,
              ],
            },
            {
              "comment": "
      ",
              "elements": [
                {
                  "name": "f3",
                },
              ],
              "position": [
                20,
                0,
              ],
            },
          ],
          "imports": [
            {
              "comment": "
      // import declarations
      ",
              "elements": [
                {
                  "name": "default",
                },
              ],
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
              "comment": "
      ",
              "elements": [
                {
                  "name": "d2",
                  "propertyName": undefined,
                },
              ],
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
              "comment": "
      ",
              "elements": [
                {
                  "name": "d4",
                  "propertyName": "d3",
                },
              ],
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
              "comment": "
      ",
              "elements": [
                {
                  "name": "d3_1",
                  "propertyName": "default",
                },
              ],
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
              "comment": "
      ",
              "elements": [],
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
              "comment": "

      // export declarations
      ",
              "elements": [
                {
                  "name": "r1",
                  "propertyName": undefined,
                },
              ],
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
              "comment": "
      ",
              "elements": [
                {
                  "name": "r3",
                  "propertyName": "r2",
                },
              ],
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
              "comment": "
      ",
              "elements": [
                {
                  "name": "r2_1",
                  "propertyName": "default",
                },
              ],
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
              "comment": "
      ",
              "elements": [],
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
              "comment": "

      // more cases
      ",
              "elements": [],
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
              "comment": "
      ",
              "elements": [
                {
                  "name": "yes1",
                },
              ],
              "position": [
                2,
                0,
              ],
            },
            {
              "comment": "

      ",
              "elements": [
                {
                  "name": "yes2",
                },
              ],
              "position": [
                6,
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
