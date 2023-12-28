import { tinyassert } from "@hiogawa/utils";

async function main() {
  const res = await fetch(
    "https://github.com/keithamus/sort-package-json/raw/v2.6.0/defaultRules.md"
  );
  tinyassert(res.ok);
  const text = await res.text();
  const match = text.match(/---- \|\n(.*?)\n\n/ms);
  tinyassert(match);
  const keys = match[1]
    .split("\n")
    .map((line) => line.split("|")[1].trim().replace("\\", ""));
  console.log(JSON.stringify(keys, null, 2));
}

main();
