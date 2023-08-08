import { describe, expect, it, vi } from "vitest";
import { TinyCli } from "./cli";
import { arg } from "./presets";

describe(TinyCli, () => {
  it("basic", () => {
    const logOverride = vi.fn();

    const cli = new TinyCli({
      program: "example.js",
      version: "1.2.3-pre.4",
      description: "Some description for CLI",
      logOverride,
    });

    cli.defineCommand(
      {
        name: "dev",
        args: {
          host: arg.string("dev server host", { default: "localhost" }),
          port: arg.number("dev server port", { default: 5172 }),
        },
      },
      ({ args }) =>
        args satisfies {
          port: number;
        }
    );

    cli.defineCommand(
      {
        name: "build",
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
    expect(logOverride.mock.lastCall).toMatchInlineSnapshot(`
      [
        "1.2.3-pre.4",
      ]
    `);

    // help
    expect(cli.parse(["--help"])).toMatchInlineSnapshot("undefined");
    expect(logOverride.mock.lastCall).toMatchInlineSnapshot(`
      [
        "example.js/1.2.3-pre.4

      Usage:
        $ example.js <command>

      Some description for CLI

      Available commands:
        dev
        build
      ",
      ]
    `);

    expect(cli.parse(["dev", "--help"])).toMatchInlineSnapshot("undefined");
    expect(logOverride.mock.lastCall).toMatchInlineSnapshot(`
      [
        "Usage:
        $ example.js dev [options]

      Options:
        --host=...    dev server host
        --port=...    dev server port
      ",
      ]
    `);

    expect(cli.parse(["build", "--help"])).toMatchInlineSnapshot("undefined");
    expect(logOverride.mock.lastCall).toMatchInlineSnapshot(`
      [
        "Usage:
        $ example.js build [options] <file>

      Positional arguments:
        file    entry file

      Options:
        --outDir=...    output directory
      ",
      ]
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
