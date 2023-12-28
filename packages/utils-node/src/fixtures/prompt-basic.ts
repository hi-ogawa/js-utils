import { promptQuestion } from "../prompt";

// npx tsx packages/utils-node/src/fixtures/prompt-basic.ts

async function main() {
  const answer = await promptQuestion("hello? ");
  console.log("answer:", answer);
}

main();
