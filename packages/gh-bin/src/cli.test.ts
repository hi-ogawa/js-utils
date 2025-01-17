import { $ } from "@hiogawa/utils-node";
import { it } from "vitest";

it("basic", async () => {
  await $`pnpm cli -h`;
});
