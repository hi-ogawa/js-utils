import readline from "node:readline";

// cf. https://github.com/google/zx/blob/956dcc3bbdd349ac4c41f8db51add4efa2f58456/src/goods.ts#L83
export async function promptQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // delegate SIGINT (cf. https://github.com/SBoudrias/Inquirer.js/pull/569)
  rl.once("SIGINT", () => {
    rl.write("\n"); // tiny aesthetics improvement on Ctrl-C
    process.kill(process.pid, "SIGINT");
  });
  try {
    return await new Promise((resolve) => {
      rl.question(query, (v) => resolve(v));
    });
  } finally {
    rl.close();
  }
}
