import { builtinModules } from "node:module";
import { promptAutocomplete } from "@hiogawa/utils-node";

async function main() {
  const result = await promptAutocomplete({
    message: "Select node builtin module",
    suggest: (input) => {
      return builtinModules.filter((v) => v.includes(input));
    },
  });
  console.log("[RESULT]", result);
}

main();
