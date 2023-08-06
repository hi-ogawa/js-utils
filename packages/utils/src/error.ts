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
 * something like consola.error + flattenErrorCauses,
 * which can be useful, for example, to quickly provide good-enough error log for cli.
 */
export function consoleErrorPretty(v: unknown, config?: { noColor?: boolean }) {
  const errors = flattenErrorCauses(v);
  for (let i = 0; i < errors.length; i++) {
    const e = errors[i];
    let label = "ERROR";
    if (i > 0) {
      label += ":CAUSE";
      if (i > 1) {
        label += `:${i}`;
      }
    }
    const e2 = e instanceof Error ? e : { message: String(e) };
    console.error(formatErrorPretty(label, e2, !config?.noColor));
  }
}

// cf. consola.error
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/utils/color.ts#L93
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/reporters/fancy.ts#L49
// https://github.com/unjs/consola/blob/e4a37c1cd2c8d96b5f30d8c13ff2df32244baa6a/src/reporters/fancy.ts#L64-L65
function formatErrorPretty(
  label: string,
  e: Pick<Error, "message" | "stack">,
  color?: boolean
) {
  let stack = e.stack?.split("\n").slice(1).join("\n") ?? "";

  if (color) {
    label = `\u001B[41m ${label} \u001B[49m`;
    stack = stack && `\u001B[36m${stack}\u001B[39m`;
  } else {
    label = `[${label}]`;
  }

  return `\

${label} ${e.message}

${stack && stack + "\n"}`;
}
