import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineSubCommands } from "./sub-command";
import { defineCommand } from "./typed";

describe(defineSubCommands, () => {
  it("basic", () => {
    const example = defineSubCommands({
      dev: defineCommand(
        {
          port: {
            parse: z.coerce.number().default(5172).parse,
          },
        },
        ({ args }) => {
          return args;
        }
      ),
      build: defineCommand(
        {
          file: {
            type: "positional",
            parse: z.string().optional().parse,
          },
          outDir: {
            parse: z.string().default("./dist").parse,
          },
        },
        ({ args }) => {
          return args;
        }
      ),
    });

    expect(example.help()).toMatchInlineSnapshot(`
      "usage:
        $ program <command> ...

      commands:
        dev
        build
      "
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
