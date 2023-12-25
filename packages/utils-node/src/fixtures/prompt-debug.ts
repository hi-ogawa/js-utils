import { colors, createManualPromise } from "@hiogawa/utils";
import {
  formatInputCursor,
  getSpecialKey,
  subscribePromptEvent,
} from "../prompt-utils";

/*

quick debugging of keypress event
  npx tsx packages/utils-node/src/fixtures/prompt-debug.ts

*/

async function main() {
  const manual = createManualPromise<void>();
  const { rl, dispose } = subscribePromptEvent((e) => {
    console.log([rl.line, rl.cursor], JSON.stringify(e));
    if (e.input === "q" || getSpecialKey(e) === "abort") {
      manual.resolve();
      return;
    }
    console.log(colors.dim("> ") + formatInputCursor(rl));
  });
  console.log(":: echo keypress event ('q' to quit)");
  try {
    await manual;
  } finally {
    dispose();
  }
}

main();
