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
  const dispose = subscribePromptEvent((e) => {
    console.log(JSON.stringify(e));
    if (e.type === "keypress") {
      const special = getSpecialKey(e.data);
      if (e.data.input === "q" || special === "abort") {
        manual.resolve();
      }
    }
    if (e.type === "input") {
      console.log(e.data);
      console.log(colors.dim("> ") + formatInputCursor(e.data));
    }
  });
  console.log(":: echo keypress event ('q' to quit)");
  try {
    await manual;
  } finally {
    dispose();
  }
}

main();
