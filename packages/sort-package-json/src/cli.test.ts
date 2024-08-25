import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { beforeAll, expect, test } from "vitest";

const $ = promisify(execFile);

const baseDir = path.join(
  import.meta.dirname,
  "../node_modules/.cache/fixtures"
);

beforeAll(() => {
  fs.rmSync(baseDir, { recursive: true, force: true });
  fs.cpSync(path.join(import.meta.dirname, "./fixtures"), baseDir, {
    recursive: true,
  });
});

test("basic", async () => {
  const file = path.join(baseDir, "./basic/package.json");
  const result = await $("pnpm", ["-s", "cli-dev", file]);
  expect(fs.readFileSync(file, "utf-8")).toMatchInlineSnapshot(`
    "{
      "name": "test",
      "private": true,
      "type": "module",
      "dependencies": {
        "a": "^1",
        "b": "^0"
      }
    }
    "
  `);
  expect(result.stdout.replaceAll(baseDir, "<baseDir>")).toMatchInlineSnapshot(`
    "[fixed] <baseDir>/basic/package.json
    "
  `);
});

test("directory", async () => {
  const file = path.join(baseDir, "./directory/package.json");
  const result = await $("pnpm", ["-s", "cli-dev", path.dirname(file)]);
  expect(result.stdout.replaceAll(baseDir, "<baseDir>")).toMatchInlineSnapshot(`
    "[fixed] <baseDir>/directory/package.json
    "
  `);
  expect(fs.readFileSync(file, "utf-8")).toMatchInlineSnapshot(`
    "{
      "name": "test",
      "type": "module"
    }
    "
  `);
});
