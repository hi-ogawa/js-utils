import readline from "node:readline";
import { promisify } from "node:util";
import { createManualPromise } from "@hiogawa/utils";
import {
  CSI,
  type KeyInfo,
  computeHeight,
  getSpecialKey,
  setupKeypressHandler,
} from "./prompt-utils";

// cf. https://github.com/google/zx/blob/956dcc3bbdd349ac4c41f8db51add4efa2f58456/src/goods.ts#L83
export async function promptQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // delegate SIGINT (cf. https://github.com/SBoudrias/Inquirer.js/pull/569)
  rl.once("SIGINT", () => {
    rl.write("\n"); // tiny aesthetics to get next cursor after new line
    process.kill(process.pid, "SIGINT");
  });
  try {
    const manual = createManualPromise<string>();
    rl.question(query, (v) => manual.resolve(v));
    return await manual.promise;
  } finally {
    rl.close();
  }
}

// cf. https://github.com/terkelg/prompts/blob/735603af7c7990ac9efcfba6146967a7dbb15f50/lib/elements/autocomplete.js#L97-L108
export async function promptAutocomplete(config: {
  message: string;
  loadOptions: (input: string) => Promise<string[]>;
}) {
  const write = promisify(process.stdout.write.bind(process.stdout));
  const manual = createManualPromise<void>();

  let input = "";
  let value: string | undefined;
  let done = false;

  async function render() {
    const options = await config.loadOptions(input);

    const part1 = config.message + input;
    if (done) {
      await write(part1);
      return;
    }

    // TODO: pagination based on process.stdout.rows?
    const part2 = options
      .slice(0, 20)
      .map((v) => `    ${v}\n`)
      .join("");
    const content = [part1, "\n", part2].join("");

    // 1. clean screen below
    // 2. write content
    // 3. reset cursor position
    const height = computeHeight(content, process.stdout.columns);
    await write(
      [`${CSI}0J`, content, `${CSI}${height - 1}A`, `${CSI}1G`].join("")
    );
  }

  // TODO: async handler race condition
  async function keypressHandler(str: string | undefined, key: KeyInfo) {
    switch (getSpecialKey(str, key)) {
      case "abort":
      case "escape": {
        value = undefined;
        done = true;
        manual.resolve();
        return;
      }
      case "enter":
      case "return": {
        value = input;
        done = true;
        manual.resolve();
        return;
      }
      case "backspace": {
        input = input.slice(0, -1);
        break;
      }
      default: {
        if (typeof str === "undefined") {
          return;
        }
        input += str;
      }
    }
    await render();
  }

  let dispose: (() => void) | undefined;
  try {
    await write(`${CSI}?25l`); // hide cursor
    await render();
    dispose = setupKeypressHandler(keypressHandler);
    await manual.promise;
    return { input, value };
  } finally {
    dispose?.();
    await write(`${CSI}0J`); // clean below
    await render();
    await write(`${CSI}?25h`); // show cursor
  }
}
