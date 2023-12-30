import { tinyassert } from "@hiogawa/utils";

async function main() {
  const url =
    "https://raw.githubusercontent.com/nodejs/node/ee61c2c6d3e97425b16d6821118084a833e52e29/lib/internal/readline/utils.js";
  const res = await fetch(url);
  tinyassert(res.ok);
  const code = await res.text();
  const matches = code.matchAll(/key\.name = '(.*?)'/g);
  let keys = [...matches].map((m) => m[1]);
  keys = [...new Set(keys)];
  console.log(JSON.stringify(keys));
}

main();
