import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { TinyCli, TinyCliCommand } from "./cli";
import { arg } from "./presets";

describe(TinyCli, () => {
  it("basic", () => {
    const mockLog = vi.fn();

    const cli = new TinyCli({
      program: "example.js",
      version: "1.2.3-pre.4",
      description: "Some description for CLI",
      log: mockLog,
    });

    cli.defineCommand(
      {
        name: "dev",
        description: "Start dev server",
        args: {
          host: arg.string("dev server host", { default: "localhost" }),
          port: arg.number("dev server port", { default: 5172 }),
        },
      },
      ({ args }) =>
        args satisfies {
          host: string;
          port: number;
        }
    );

    cli.defineCommand(
      {
        name: "build",
        description: "Build for production",
        args: {
          file: arg.string("entry file", {
            positional: true,
            default: "./index.html",
          }),
          outDir: arg.string("output directory", { default: "./dist" }),
        },
      },
      ({ args }) =>
        args satisfies {
          file?: string;
          outDir: string;
        }
    );

    // invalid usage
    expect(() =>
      cli.defineCommand(
        {
          name: "bad",
          args: {
            a: { parse: () => "", positional: true, flag: true },
          },
        },
        () => {}
      )
    ).toThrowErrorMatchingInlineSnapshot(
      "\"argument must be either one of 'positional', 'flag', or 'key-value'\""
    );

    // version
    expect(cli.parse(["--version"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.lastCall).toMatchInlineSnapshot(`
      [
        "1.2.3-pre.4",
      ]
    `);

    // help
    expect(cli.parse(["--help"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.lastCall).toMatchInlineSnapshot(`
      [
        "example.js/1.2.3-pre.4

      Usage:
        $ example.js <command>

      Some description for CLI

      Available commands:
        dev      Start dev server
        build    Build for production
      ",
      ]
    `);

    expect(cli.parse(["dev", "--help"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.lastCall).toMatchInlineSnapshot(`
      [
        "example.js/1.2.3-pre.4

      Usage:
        $ example.js dev [options]

      Start dev server

      Options:
        --host=...    dev server host
        --port=...    dev server port
      ",
      ]
    `);

    expect(cli.parse(["build", "--help"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.lastCall).toMatchInlineSnapshot(`
      [
        "example.js/1.2.3-pre.4

      Usage:
        $ example.js build [options] <file>

      Build for production

      Positional arguments:
        file    entry file

      Options:
        --outDir=...    output directory
      ",
      ]
    `);

    // help can show last matched sub command
    expect(cli.help()).toMatchInlineSnapshot(`
      "example.js/1.2.3-pre.4

      Usage:
        $ example.js build [options] <file>

      Build for production

      Positional arguments:
        file    entry file

      Options:
        --outDir=...    output directory
      "
    `);
    expect(cli.help({ noLastMatched: true })).toMatchInlineSnapshot(`
      "example.js/1.2.3-pre.4

      Usage:
        $ example.js <command>

      Some description for CLI

      Available commands:
        dev      Start dev server
        build    Build for production
      "
    `);

    // error
    expect(() => cli.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"missing command"'
    );

    expect(() => cli.parse(["publish"])).toThrowErrorMatchingInlineSnapshot(
      "\"invalid command: 'publish'\""
    );

    // dev
    expect(cli.parse(["dev"])).toMatchInlineSnapshot(`
      {
        "host": "localhost",
        "port": 5172,
      }
    `);
    expect(cli.parse(["dev", "--port", "3000"])).toMatchInlineSnapshot(`
      {
        "host": "localhost",
        "port": 3000,
      }
    `);
    expect(() =>
      cli.parse(["dev", "--port", "one-two-three"])
    ).toThrowErrorMatchingInlineSnapshot('"failed to parse --port"');

    // build
    expect(cli.parse(["build"])).toMatchInlineSnapshot(`
      {
        "file": "./index.html",
        "outDir": "./dist",
      }
    `);
    expect(cli.parse(["build", "./src/index.tsx"])).toMatchInlineSnapshot(`
      {
        "file": "./src/index.tsx",
        "outDir": "./dist",
      }
    `);
  });
});

describe(TinyCliCommand, () => {
  it("basic", () => {
    const mockLog = vi.fn();

    const cli = new TinyCliCommand(
      {
        program: "example.js",
        version: "1.2.3-pre.4",
        description: "Some description for CLI",
        log: mockLog,
        args: {
          host: arg.string("http server host", { default: "localhost" }),
          port: arg.number("http server port", { default: 5172 }),
        },
      },
      ({ args }) =>
        args satisfies {
          host: string;
          port: number;
        }
    );

    // version
    expect(cli.parse(["--version"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.lastCall).toMatchInlineSnapshot(`
      [
        "1.2.3-pre.4",
      ]
    `);

    // help
    expect(cli.parse(["--help"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.lastCall).toMatchInlineSnapshot(`
      [
        "example.js/1.2.3-pre.4

      Usage:
        $ example.js [options]

      Some description for CLI

      Options:
        --host=...    http server host
        --port=...    http server port
      ",
      ]
    `);

    // command
    expect(cli.parse(["--port", "3000"])).toMatchInlineSnapshot(`
      {
        "host": "localhost",
        "port": 3000,
      }
    `);
    expect(() =>
      cli.parse(["--port", "one-two-three"])
    ).toThrowErrorMatchingInlineSnapshot('"failed to parse --port"');
  });

  it("extra", () => {
    const mockLog = vi.fn();

    const cli = new TinyCliCommand(
      {
        log: mockLog,
        args: {
          arg: arg.string("this is required arg", { positional: true }),
          argOpt: arg.string("this is not required", {
            positional: true,
            optional: true,
          }),
          num: arg.number(),
          numOpt: arg.number("", { optional: true }),
          numOptDefault: arg.number("optional and default 10", { default: 10 }),
          str: arg.string(),
          boolFlag: arg.boolean("some toggle"),
        },
      },
      ({ args }) => {
        args satisfies {
          arg: string;
          argOpt?: string;
          num: number;
          numOpt?: number;
          numOptDefault: number;
          str: string;
          boolFlag: boolean;
        };
        return args;
      }
    );

    expect(cli.help()).toMatchInlineSnapshot(`
      "example-cli

      Usage:
        $ example-cli [options] <arg> <argOpt>

      Positional arguments:
        arg       this is required arg
        argOpt    this is not required

      Options:
        --num=...
        --numOpt=...
        --numOptDefault=...    optional and default 10
        --str=...
        --boolFlag             some toggle
      "
    `);

    expect(cli.parse(["x", "--boolFlag", "--num", "123", "--str", "hey"]))
      .toMatchInlineSnapshot(`
        {
          "arg": "x",
          "argOpt": undefined,
          "boolFlag": true,
          "num": 123,
          "numOpt": undefined,
          "numOptDefault": 10,
          "str": "hey",
        }
      `);

    expect(() => cli.parse(["x", "y", "z"])).toThrowErrorMatchingInlineSnapshot(
      '"too many arguments: x, y, z"'
    );

    expect(() =>
      cli.parse(["x", "--hehe", "he", "--foo"])
    ).toThrowErrorMatchingInlineSnapshot('"unknown options: --hehe, --foo"');

    expect(() =>
      cli.parse(["x", "--hehe", "--hehe"])
    ).toThrowErrorMatchingInlineSnapshot('"duplicate options: --hehe"');

    expect(() => cli.parse(["x"])).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse --num"'
    );

    expect(cli.parse(["--help"])).toMatchInlineSnapshot("undefined");
    expect(mockLog.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "example-cli

      Usage:
        $ example-cli [options] <arg> <argOpt>

      Positional arguments:
        arg       this is required arg
        argOpt    this is not required

      Options:
        --num=...
        --numOpt=...
        --numOptDefault=...    optional and default 10
        --str=...
        --boolFlag             some toggle
      ",
        ],
      ]
    `);
  });

  describe("variadic", () => {
    it("basic", () => {
      const example = new TinyCliCommand(
        {
          args: {
            files: {
              positional: true,
              variadic: true,
              description: "input files",
              parse: z.string().array().parse,
            },
            fix: {
              flag: true,
              description: "fix files in-place",
              parse: z.coerce.boolean().parse,
            },
          },
        },
        ({ args }) => {
          args satisfies {
            files: string[];
            fix: boolean;
          };
          return args;
        }
      );

      expect(example.help()).toMatchInlineSnapshot(`
        "example-cli

        Usage:
          $ example-cli [options] <files...>

        Positional arguments:
          files    input files

        Options:
          --fix    fix files in-place
        "
      `);

      expect(example.parse([])).toMatchInlineSnapshot(`
        {
          "files": [],
          "fix": false,
        }
      `);
      expect(example.parse(["x", "--fix", "y", "z"])).toMatchInlineSnapshot(`
        {
          "files": [
            "x",
            "y",
            "z",
          ],
          "fix": true,
        }
      `);
    });

    it("unsupported", () => {
      const example = () =>
        new TinyCliCommand(
          {
            args: {
              first: {
                positional: true,
                parse: z.string().parse,
              },
              rest: {
                positional: true,
                variadic: true,
                parse: z.string().array().parse,
              },
            },
          },
          ({ args }) => {
            args satisfies {
              first: string;
              rest: string[];
            };
            return args;
          }
        );
      expect(() => example()).toThrowErrorMatchingInlineSnapshot(
        '"variadic command with multiple positionals are unsupported"'
      );
    });
  });

  it("positional", () => {
    const command = new TinyCliCommand(
      {
        args: {
          arg: {
            positional: true,
            parse: z.string().parse,
          },
        },
      },
      ({ args }) => args
    );

    expect(() => command.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"failed to parse <arg>"'
    );
  });
});
