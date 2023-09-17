import process from "node:process";
import fs from "node:fs";

// sort top-level keys of package.json based on
//   https://github.com/keithamus/sort-package-json/blob/main/defaultRules.md

// generate RULE by
//   SCRAPE_RULE=1 node misc/sort-package-json.mjs
if (process.env["SCRAPE_RULE"]) {
  const text = await fetch(
    "https://github.com/keithamus/sort-package-json/raw/main/defaultRules.md"
  ).then((res) => res.text());
  const keys = text
    .match(/---- \|\n(.*?)\n\n/ms)[1]
    .split("\n")
    .map((line) => line.split("|")[1].trim().replace("\\", ""));
  console.log(JSON.stringify(keys, null, 2));
  process.exit(1);
}

const RULE = [
  "$schema",
  "name",
  "displayName",
  "version",
  "private",
  "description",
  "categories",
  "keywords",
  "homepage",
  "bugs",
  "repository",
  "funding",
  "license",
  "qna",
  "author",
  "maintainers",
  "contributors",
  "publisher",
  "sideEffects",
  "type",
  "imports",
  "exports",
  "main",
  "svelte",
  "umd:main",
  "jsdelivr",
  "unpkg",
  "module",
  "source",
  "jsnext:main",
  "browser",
  "react-native",
  "types",
  "typesVersions",
  "typings",
  "style",
  "example",
  "examplestyle",
  "assets",
  "bin",
  "man",
  "directories",
  "files",
  "workspaces",
  "binary,",
  "scripts",
  "betterScripts",
  "contributes",
  "activationEvents",
  "husky",
  "simple-git-hooks",
  "pre-commit",
  "commitlint",
  "lint-staged",
  "config",
  "nodemonConfig",
  "browserify",
  "babel",
  "browserslist",
  "xo",
  "prettier",
  "eslintConfig",
  "eslintIgnore",
  "npmpackagejsonlint",
  "release",
  "remarkConfig",
  "stylelint",
  "ava",
  "jest",
  "mocha",
  "nyc",
  "tap",
  "resolutions",
  "dependencies",
  "devDependencies",
  "dependenciesMeta",
  "peerDependencies",
  "peerDependenciesMeta",
  "optionalDependencies",
  "bundledDependencies",
  "bundleDependencies",
  "extensionPack",
  "extensionDependencies",
  "flat",
  "packageManager",
  "engines",
  "engineStrict",
  "volta",
  "languageName",
  "os",
  "cpu",
  "preferGlobal",
  "publishConfig",
  "icon",
  "badges",
  "galleryBanner",
  "preview",
  "markdown",
];
const RULE_MAP = Object.fromEntries(
  Object.entries(RULE).map(([k, v]) => [v, Number(k)])
);

const packageJsonPath = process.argv[2];
const original = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const sorted = Object.fromEntries(
  Object.entries(original).sort(
    ([k1], [k2]) => (RULE_MAP[k1] ?? 1e8) - (RULE_MAP[k2] ?? 1e8)
  )
);
fs.writeFileSync(packageJsonPath, JSON.stringify(sorted, null, 2) + "\n");
