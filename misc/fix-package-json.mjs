import { $ } from "@hiogawa/utils-node";
import fs from "node:fs";
import process from "node:process";

// usage:
//   node misc/fix-package-json.mjs

$._.verbose = true;

const cwd = process.cwd();
const pnpmList = JSON.parse(await $`pnpm ls --filter '*' --depth -1 --json`);
const paths = pnpmList.map((e) => e.path);
for (const path of paths) {
  fix(path);
}

function fix(path) {
  const packageJsonPath = path + "/package.json";
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  if (!packageJson.private) {
    const relPath = path.slice(cwd.length + 1);
    Object.assign(packageJson, {
      repository: {
        type: "git",
        url: "https://github.com/hi-ogawa/js-utils",
        directory: relPath,
      },
      homepage: "https://github.com/hi-ogawa/js-utils/tree/main/" + relPath,
    });
  }
  if (!packageJson.volta) {
    Object.assign(packageJson, {
      volta: {
        extends: "../../package.json",
      },
    });
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
