import { $ } from "@hiogawa/utils-node";
import { it } from "vitest";

it("basic", { timeout: 60_000 }, async () => {
  await $`pnpm -s cli -h`;
});
