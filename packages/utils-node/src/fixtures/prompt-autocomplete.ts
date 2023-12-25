import { builtinModules } from "node:module";
import { colors } from "@hiogawa/utils";
import { promptAutocomplete } from "../prompt";

/*

demo
  npx tsx packages/utils-node/src/fixtures/prompt-autocomplete.ts

*/

async function main() {
  const result = await promptAutocomplete({
    message: colors.cyan("?") + " select node builtin module > ",
    suggest: (input) => {
      return builtinModules.filter(v => v.includes(input));
    },
  });
  console.log("\n[answer]", result);
}

main();
