import { createManualPromise } from "@hiogawa/utils";
import { setupKeypressHandler } from "../prompt-utils";

/*

quick debugging of keypress event
  npx tsx packages/utils-node/src/fixtures/prompt-debug.ts

*/

async function main() {
  const manual = createManualPromise<void>();
  const dispose = setupKeypressHandler((str, key) => {
    console.log({ str, key });
    if (str === "q" || str === "\x03") {
      manual.resolve()
    }
  });
  console.log(":: echo keypress event ('q' to quit)")
  try {
    await manual;
  } finally {
    dispose();
  }
}

main();
