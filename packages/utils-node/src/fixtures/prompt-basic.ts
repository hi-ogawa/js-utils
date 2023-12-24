import { promptQuestion } from "../prompt";

async function main() {
  const answer = await promptQuestion("hello? ");
  console.log("answer:", answer);
}

main();
