/**
 * traverse Error.cause chain and collect potential errors
 */
export function flattenErrorCauses(e: unknown): unknown[] {
  let errors: unknown[] = [e];
  for (let i = 0; ; i++) {
    if (i > 100) throw new Error("bound loop just in case");
    if (e instanceof Error && e.cause && !errors.includes(e.cause)) {
      errors.push(e.cause);
      e = e.cause;
      continue;
    }
    break;
  }
  return errors;
}

/**
 * flattenErrorCauses + formatError
 * which can be useful, for example, to quickly provide good-enough error log for cli.
 */
export function consoleErrorExtra(e: unknown) {
  const errors = flattenErrorCauses(e);
  for (let i = 0; i < errors.length; i++) {
    const err = errors[i];
    if (err instanceof Error) {
      console.error(formatError(err));
    } else {
      console.error(err);
    }
  }
}

// simpler port of consola.error
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/utils/color.ts#L93
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/reporters/fancy.ts#L49
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/reporters/fancy.ts#L64-L65
function formatError(e: Error) {
  // color?
  // \u001B[41m ERROR \u001B[49m
  // \u001B[36m${stack}\u001B[39m

  let result = `\

[ERROR] ${e.message}

`;
  if (e.stack) {
    const stack = e.stack.split("\n").slice(1).join("\n");
    result += `\
${stack}
`;
  }
  return result;
}
