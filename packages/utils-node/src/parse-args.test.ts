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
          $help: "(default: last commit modified CHANGELOG.md)",
        },
        to: {
          type: "string",
          default: "HEAD",
          $help: "(default: HEAD)",
        },
        dir: {
          type: "string",
          $help: "(default: process.cwd())",
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
        --from=...    (default: last commit modified CHANGELOG.md)
        --to=...      (default: HEAD)
        --dir=...     (default: process.cwd())
        --dry
        --help, -h

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
