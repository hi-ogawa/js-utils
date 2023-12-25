import { builtinModules } from "node:module";
import { promptAutocomplete } from "../prompt";

/*

demo
  npx tsx packages/utils-node/src/fixtures/prompt-autocomplete.ts

*/

async function main() {
  const result = await promptAutocomplete({
    message: "Q. select node builtin module > ",
    loadOptions: async (input) => {
      return builtinModules.filter(v => v.includes(input));
    }
  });
  console.log("\n[answer]", result);
}

main();
