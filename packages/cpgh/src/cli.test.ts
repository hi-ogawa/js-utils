import { $ } from "@hiogawa/utils-node";
import { expect, it } from "vitest";

it("basic", async () => {
  await $`pnpm cli --force https://github.com/vitest-dev/vitest/tree/main/examples/basic /tmp/my-project`;
  const output = await $`ls /tmp/my-project`;
  expect(output.split(/\s/).sort()).toMatchInlineSnapshot(`
    [
      "README.md",
      "package.json",
      "src",
      "test",
      "tsconfig.json",
      "vite.config.ts",
    ]
  `);
});
