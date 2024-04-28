import { $ } from "@hiogawa/utils-node";
import { expect, it } from "vitest";

it("basic", { timeout: 60_000 }, async () => {
  const output = await $`pnpm -s cli -h`;
  expect(output).toMatchInlineSnapshot(`
    "changelog/0.0.0

    Usage:
      $ changelog [options]

    Options:
      --from=...       (default: last commit modified CHANGELOG.md)
      --to=...         (default: HEAD)
      --dir=...        (default: process.cwd())
      --dry
      --removeScope
      --help, -h"
  `);
});
