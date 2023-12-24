import readline from "node:readline";
import { promisify } from "node:util";
import { createManualPromise } from "@hiogawa/utils";
import { CSI, computeHeight } from "./prompt-utils";

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
}): Promise<AutocompleteResult> {
  const write = promisify(process.stdout.write.bind(process.stdout));
  const manual = createManualPromise<AutocompleteResult>();
  let input = "";

  async function render(renderOptions?: { done?: boolean }) {
    const options = await config.loadOptions(input);

    const part1 = config.message + " > " + input;
    if (renderOptions?.done) {
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
  async function keypressHandler(str: string, key: KeyInfo) {
    // TODO: more special keys
    // https://github.com/terkelg/prompts/blob/735603af7c7990ac9efcfba6146967a7dbb15f50/lib/util/action.js#L18-L26
    if (key.name === "escape" || (key.ctrl && key.name === "c")) {
      manual.resolve({ input, value: "", ok: false });
      return;
    }
    if (key.name === "return" || key.name === "enter") {
      manual.resolve({ input, value: input, ok: true });
      return;
    }
    if (key.name === "backspace") {
      input = input.slice(0, -1);
    } else {
      input += str;
    }
    await render();
  }

  let dispose: (() => void) | undefined;
  try {
    await write(`${CSI}?25l`); // hide cursor
    await render();
    dispose = setupKeypressHandler(keypressHandler);
    return await manual.promise;
  } finally {
    dispose?.();
    await render({ done: true });
    await write(`${CSI}0J`); // clean below
    await write(`${CSI}?25h`); // show cursor
  }
}

interface AutocompleteResult {
  input: string;
  value: string;
  ok: boolean;
}

//
// keypress event utils
//

interface KeyInfo {
  sequence: string;
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

function setupKeypressHandler(handler: (str: string, key: KeyInfo) => void) {
  // setup
  const stdin = process.stdin;
  const rl = readline.createInterface({
    input: stdin,
  });
  readline.emitKeypressEvents(stdin, rl);
  let previousRawMode = stdin.isRaw;
  if (stdin.isTTY) {
    stdin.setRawMode(true);
  }
  stdin.on("keypress", handler);

  // teardown
  return () => {
    stdin.off("keypress", handler);
    if (stdin.isTTY) {
      stdin.setRawMode(previousRawMode);
    }
    rl.close();
  };
}
