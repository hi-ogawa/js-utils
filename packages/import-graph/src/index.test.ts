import * as esModuleLexer from "es-module-lexer";
import { beforeAll, describe, expect, it } from "vitest";
import { analyzeCode } from ".";

beforeAll(() => esModuleLexer.init);

describe(analyzeCode, () => {
  it("basic", () => {
    const code = `
import someDefaultImport, { someNamedImport, x as someRenamedImport } from "./some-dep1";
import * as someStarImport from "./some-dep2";

export default "someDefaultExport";
export const someNamedExport = "someNamedExport";
export { someNamedExport as someRenamedExport };
export { someReExport } from "./some-dep3";
export * from "./some-dep3";
`;
    expect(analyzeCode({ code })).toMatchInlineSnapshot(`
      {
        "exportInfos": [
          {
            "name": "default",
            "position": 146,
          },
          {
            "name": "someNamedExport",
            "position": 188,
          },
          {
            "name": "someRenamedExport",
            "position": 253,
          },
          {
            "name": "someReExport",
            "position": 283,
          },
        ],
        "importInfos": [
          {
            "dynamic": false,
            "position": 1,
            "source": "./some-dep1",
            "specifierDefault": false,
            "specifierStar": false,
            "specifiers": [],
          },
          {
            "dynamic": false,
            "position": 91,
            "source": "./some-dep2",
            "specifierDefault": false,
            "specifierStar": false,
            "specifiers": [],
          },
          {
            "dynamic": false,
            "position": 274,
            "source": "./some-dep3",
            "specifierDefault": false,
            "specifierStar": false,
            "specifiers": [],
          },
          {
            "dynamic": false,
            "position": 318,
            "source": "./some-dep3",
            "specifierDefault": false,
            "specifierStar": false,
            "specifiers": [],
          },
        ],
      }
    `);
  });
});
