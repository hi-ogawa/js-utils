import process from "node:process";
import { $ } from "@hiogawa/utils-node";

// usage:
//   node misc/generate-tsconfig.mjs > tsconfig.json

$._.verbose = true;

const pnpmList = JSON.parse(
  await $`pnpm ls --filter './packages/**' --depth -1 --json`
);
const cwdLen = process.cwd().length;
const paths = pnpmList.map((e) => e.path.slice(cwdLen + 1));
const tsconfig = {
  include: [],
  references: paths.map((path) => ({ path })),
};
console.log(JSON.stringify(tsconfig, null, 2));
