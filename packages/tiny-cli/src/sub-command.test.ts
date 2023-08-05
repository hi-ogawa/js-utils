import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineSubCommands } from "./sub-command";
import { defineCommand } from "./typed";

describe(defineSubCommands, () => {
  it("basic", () => {
    const autoHelpLog: unknown[] = [];
    const example = defineSubCommands({
      program: "tiny-cli.js",
      help: "This is a sample cli program.",
      autoHelp: true,
      autoHelpLog: (v) => autoHelpLog.push(v),
      commands: {
        dev: defineCommand(
          {
            help: "start dev server",
            args: {
              port: {
                parse: z.coerce.number().default(5172).parse,
              },
            },
          },
          ({ args }) => args
        ),
        build: defineCommand(
          {
            help: "build for production",
            args: {
              file: {
                type: "positional",
                parse: z.string().optional().parse,
              },
              outDir: {
                parse: z.string().default("./dist").parse,
              },
            },
          },
          ({ args }) => args
        ),
      },
    });

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        $ tiny-cli.js <command>

      This is a sample cli program.

      commands:
        dev      start dev server
        build    build for production
      "
    `);

    // help
    expect(autoHelpLog).toMatchInlineSnapshot("[]");
    expect(example.parse(["-h"])).toMatchInlineSnapshot("undefined");
    expect(autoHelpLog).toMatchInlineSnapshot(`
      [
        "usage:
        $ tiny-cli.js <command>

      This is a sample cli program.

      commands:
        dev      start dev server
        build    build for production
      ",
      ]
    `);
    expect(example.parse(["dev", "-h"])).toMatchInlineSnapshot("undefined");
    expect(autoHelpLog).toMatchInlineSnapshot(`
      [
        "usage:
        $ tiny-cli.js <command>

      This is a sample cli program.

      commands:
        dev      start dev server
        build    build for production
      ",
        "usage:
        $ tiny-cli.js dev [options]

      start dev server

      options:
        --port=...
      ",
      ]
    `);

    // error command
    expect(() => example.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"missing command"'
    );

    expect(() => example.parse(["publish"])).toThrowErrorMatchingInlineSnapshot(
      "\"invalid command: 'publish'\""
    );

    // dev
    expect(example.parse(["dev"])).toMatchInlineSnapshot(`
      {
        "port": 5172,
      }
    `);
    expect(example.parse(["dev", "--port", "3000"])).toMatchInlineSnapshot(`
      {
        "port": 3000,
      }
    `);
    expect(() =>
      example.parse(["dev", "--port", "one-two-three"])
    ).toThrowErrorMatchingInlineSnapshot('"failed to parse --port"');

    // build
    expect(example.parse(["build"])).toMatchInlineSnapshot(`
      {
        "file": undefined,
        "outDir": "./dist",
      }
    `);
    expect(example.parse(["build", "./src/index.tsx"])).toMatchInlineSnapshot(`
      {
        "file": "./src/index.tsx",
        "outDir": "./dist",
      }
    `);
  });
});
