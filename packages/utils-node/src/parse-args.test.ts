import { parseArgs } from "util";
import { describe, expect, it } from "vitest";
import { type ParseArgsConfigExtra, generateParseArgsHelp } from "./parse-args";

describe(generateParseArgsHelp, () => {
  it("basic", () => {
    const config = {
      $program: "changelog",
      $version: "0.0.0",
      options: {
        from: {
          type: "string",
          $description: "(default: last commit modified CHANGELOG.md)",
          $argument: "<commit>",
        },
        to: {
          type: "string",
          default: "HEAD",
          $description: "(default: HEAD)",
          $argument: "<commit>",
        },
        dir: {
          type: "string",
          $description: "(default: process.cwd())",
          $argument: "<path>",
        },
        dry: {
          type: "boolean",
        },
        help: {
          type: "boolean",
          short: "h",
        },
      },
    } satisfies ParseArgsConfigExtra;

    expect(generateParseArgsHelp(config)).toMatchInlineSnapshot(`
      "changelog/0.0.0

      Usage:
        $ changelog [options]

      Options:
        --from <commit>    (default: last commit modified CHANGELOG.md)
        --to <commit>      (default: HEAD)
        --dir <path>       (default: process.cwd())
        --dry
        -h, --help

      "
    `);

    const args = parseArgs({
      args: ["-h"],
      ...config,
    });
    expect(args).toMatchInlineSnapshot(`
      {
        "positionals": [],
        "values": {
          "help": true,
          "to": "HEAD",
        },
      }
    `);
  });
});
