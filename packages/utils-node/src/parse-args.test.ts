import { parseArgs } from "util";
import { describe, expect, it } from "vitest";
import { type ParseArgsConfigExtra, generateParseArgsHelp } from "./parse-args";

describe(generateParseArgsHelp, () => {
  it("basic", () => {
    const config = {
      $program: "my-changelog",
      $command: "my-changelog [directory]",
      $description:
        "Generate CHANGELOG.md from git commits in the directory (default: process.cwd())",
      $version: "0.0.0",
      allowPositionals: true,
      options: {
        from: {
          type: "string",
          $description: "(default: last commit modified CHANGELOG.md)",
          $argument: "[commit]",
        },
        to: {
          type: "string",
          default: "HEAD",
          $description: "(default: HEAD)",
          $argument: "[commit]",
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
      "my-changelog/0.0.0

      Usage:
        $ my-changelog [directory]

      Generate CHANGELOG.md from git commits in the directory (default: process.cwd())

      Options:
        --from [commit]    (default: last commit modified CHANGELOG.md)
        --to [commit]      (default: HEAD)
        --dry
        -h, --help

      "
    `);

    const args = parseArgs({
      args: ["packages/hello", "--dry", "--from", "HEAD^^"],
      ...config,
    });
    expect(args).toMatchInlineSnapshot(`
      {
        "positionals": [
          "packages/hello",
        ],
        "values": {
          "dry": true,
          "from": "HEAD^^",
          "to": "HEAD",
        },
      }
    `);
  });
});
