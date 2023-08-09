import { describe, expect, it, vi } from "vitest";
import { TinyCli, TinyCliCommand, TinyCliSingle } from "./cli";
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

describe(TinyCliSingle, () => {
  it("basic", () => {
    const mockLog = vi.fn();

    const cli = new TinyCliSingle({
      program: "example.js",
      version: "1.2.3-pre.4",
      description: "Some description for CLI",
      log: mockLog,
    });

    expect(() => cli.parse([])).toThrowErrorMatchingInlineSnapshot(
      '"forgot to define command?"'
    );

    cli.defineCommand(
      {
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

    // invalid usage
    expect(() =>
      cli.defineCommand(
        {
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
        $ example.js [options]

      Some description for CLI

      Options:
        --host=...    dev server host
        --port=...    dev server port
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
});
