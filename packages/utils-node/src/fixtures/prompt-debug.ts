import { colors, createManualPromise } from "@hiogawa/utils";
import { formatInputCursor, setupKeypressHandler } from "../prompt-utils";

/*

quick debugging of keypress event
  npx tsx packages/utils-node/src/fixtures/prompt-debug.ts

*/

async function main() {
  const manual = createManualPromise<void>();
  const dispose = setupKeypressHandler(
    (str, key) => {
      console.log(JSON.stringify({ str, key }));
      if (str === "q" || str === "\x03") {
        manual.resolve();
      }
    },
    (input, cursor) => {
      console.log({ input, cursor });
      console.log(colors.dim("> ") + formatInputCursor(input, cursor));
    }
  );
  console.log(":: echo keypress event ('q' to quit)");
  try {
    await manual;
  } finally {
    dispose();
  }
}

main();
