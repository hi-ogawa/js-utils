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
export async function promptAutocomplete(options: {
  message: string;
  suggest: (input: string) => string[] | Promise<string[]>;
  limit?: number;
  hideCursor?: boolean;
}) {
  const write = promisify(process.stdout.write.bind(process.stdout));
  const manual = createManualPromise<void>();

  let input = "";
  let value: string | undefined;
  let suggestions: string[] = [];
  let suggestionIndex = 0;
  let done = false;
  let offset = 0;
  const limit = options.limit ?? Math.min(10, process.stdout.rows - 5);
  const hideCursor = options.hideCursor ?? true;

  async function updateSuggestions() {
    suggestions = await options.suggest(input);
    suggestionIndex = 0;
    offset = 0;
    value = suggestions[suggestionIndex];
  }

  function moveSelection(dir: -1 | 1) {
    suggestionIndex += dir;
    suggestionIndex = Math.min(
      Math.max(suggestionIndex, 0),
      suggestions.length - 1
    );
    value = suggestions[suggestionIndex];

    // scroll `offset` to keep `suggestionIndex` in range
    if (suggestionIndex < offset) {
      offset = suggestionIndex;
    }
    if (offset + limit <= suggestionIndex) {
      offset = suggestionIndex + 1 - limit;
    }
  }

  async function render() {
    let content = options.message + input;
    if (done) {
      await write(`${CSI}0J` + content);
      return;
    }

    content += "\n";
    content += suggestions
      .slice(offset, offset + limit)
      .map((v, i) => `  ${i + offset === suggestionIndex ? "*" : " "} ${v}\n`)
      .join("");

    // TODO: vscode's terminal have funky behavior when content height exceeds terminal height?
    // TODO: IME (e.g Japanese input) cursor is currently not considered.
    const height = computeHeight(content, process.stdout.columns);
    await write(
      // clear below + content + cursor up by "height"
      `${CSI}0J` + content + `${CSI}1A`.repeat(height - 1) + `${CSI}1G`
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
        done = true;
        manual.resolve();
        return;
      }
      case "up": {
        moveSelection(-1);
        break;
      }
      case "down": {
        moveSelection(1);
        break;
      }
      case "backspace": {
        input = input.slice(0, -1);
        await updateSuggestions();
        break;
      }
      default: {
        if (typeof str === "undefined") {
          return;
        }
        input += str;
        await updateSuggestions();
      }
    }
    await render();
  }

  let dispose: (() => void) | undefined;
  try {
    if (hideCursor) {
      await write(`${CSI}?25l`); // hide cursor
    }
    await updateSuggestions();
    await render();
    dispose = setupKeypressHandler(keypressHandler);
    await manual.promise;
    return { input, value };
  } finally {
    dispose?.();
    await render();
    if (hideCursor) {
      await write(`${CSI}?25h`); // show cursor
    }
  }
}
