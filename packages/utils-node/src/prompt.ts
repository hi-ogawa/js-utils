import readline from "node:readline";
import { createManualPromise } from "@hiogawa/utils";
import { cursorTo, kClearLine } from "./prompt-utils";

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

  async function render() {
    const options = await config.loadOptions(input);
    // TODO: clear last output
    // TODO: move cursor
    output = [
      kClearLine,
      cursorTo(0),
      config.message + " > " + input,
      "\n",
      options
        .slice(0, 10)
        .map((v) => `    ${v}\n`)
        .join(""),
    ].join("");
    process.stdout.write(output);
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
