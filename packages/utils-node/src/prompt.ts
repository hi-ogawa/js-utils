import readline from "node:readline";
import { createManualPromise } from "@hiogawa/utils";
import { CSI, ESC, cursorTo } from "./prompt-utils";

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
  const manual = createManualPromise<AutocompleteResult>();
  let input = "";
  let output = "";

  async function write(s: string) {
    const manual = createManualPromise<void>();
    process.stdout.write(s, (err) =>
      err ? manual.reject(err) : manual.resolve()
    );
    await manual;
  }

  // TODO: async handler race condition
  async function render() {
    const options = await config.loadOptions(input);

    // TODO: pagination based on process.stdout.rows?
    const part1 = config.message + " > " + input;
    const part2 = options
      .slice(0, 10)
      .map((v) => `    ${v}\n`)
      .join("");

    // simple full screen reset
    output = [
      `${CSI}2J`,
      cursorTo(0, 0),
      part1,
      `${CSI}s`,
      "\n",
      part2,
      `${CSI}u`,
    ].join("");
    await write(output);

    // clean only single line
    // (TODO: this doesn't work when prompt becomes more than one line)
    // output = [`${CSI}0J`, `${CSI}2K`, cursorTo(0), part1, `${ESC}7`].join("");
    // await write(output);
    // output = ["\n", part2, `${ESC}8`].join("");
    // await write(output);

    // TODO: keep track of last output and clear only previously rendered lines
    // process.stdout.columns;
  }

  const dispose = setupKeypressHandler(async (str: string, key: KeyInfo) => {
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
    render();
  });

  try {
    render();
    return await manual.promise;
  } finally {
    await write(`${CSI}0J`);
    dispose();
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
