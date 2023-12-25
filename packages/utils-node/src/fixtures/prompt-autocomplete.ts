import { builtinModules } from "node:module";
import { promptAutocomplete } from "../prompt";

/*

demo
  npx tsx packages/utils-node/src/fixtures/prompt-autocomplete.ts

*/

async function main() {
  const result = await promptAutocomplete({
    message: "Q. select node builtin module > ",
    suggest: (input) => {
      return builtinModules.filter(v => v.includes(input));
    },
    limit: 30,
    debug: true,
  });
  console.log("\n[answer]", result);
}

main();
