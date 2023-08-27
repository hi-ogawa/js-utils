import process from "node:process";
import { tinyassert } from "@hiogawa/utils";
import { $ } from "@hiogawa/utils-node";
import fs from "node:fs";

// usage:
//   node misc/pre-release.mjs packages/utils-node

async function main() {
  const packageDir = process.argv[2];
  tinyassert(packageDir, "missing 'packageDir'");

  // require no diff to start
  await $`git diff --exit-code --name-only`;

  // update version
  /** @type {{ version: string }} */
  const pakcageJson = JSON.parse(
    fs.readFileSync(`${packageDir}/package.json`, "utf-8")
  );
  pakcageJson.version = getNextVersion(pakcageJson.version);
  fs.writeFileSync(
    `${packageDir}/package.json`,
    JSON.stringify(pakcageJson, null, 2) + "\n"
  );
}

/**
 * @param {string} version
 */
function getNextVersion(version) {
  const vs = version.match(/(\d+).(\d+).(\d+)(?:-pre.(\d+))?/).slice(1);
  if (vs[3]) {
    vs[3] = Number(vs[3]) + 1;
  } else {
    vs[2] = Number(vs[2]) + 1;
    vs[3] = 0;
  }
  return vs.slice(0, -1).join(".") + "-pre." + vs[3];
}

main();
