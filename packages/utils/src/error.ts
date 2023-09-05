import { colors } from "./colors";

// traverse and error Error.cause chain
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

// simple but effective error printing inspired by consola.error + flattenErrorCauses
export function formatError(
  v: unknown,
  config?: { noColor?: boolean; noCause?: boolean },
) {
  const errors = config?.noCause ? [v] : flattenErrorCauses(v);
  const errorsString = errors.map((e, i) => {
    let label = "ERROR";
    if (i > 0) {
      label += ":CAUSE";
      if (i > 1) {
        label += `:${i}`;
      }
    }
    const e2 = e instanceof Error ? e : { message: String(e) };
    return formatErrorInner(label, e2, !config?.noColor);
  });
  return errorsString.join("\n");
}

// based on consola.error https://github.com/unjs/consola
function formatErrorInner(
  label: string,
  e: Pick<Error, "message" | "stack">,
  color?: boolean,
) {
  let stack = e.stack?.split("\n").slice(1).join("\n") ?? "";

  if (color) {
    label = colors.bgRed(` ${label} `);
    stack = stack && colors.cyan(stack);
  } else {
    label = `[${label}]`;
  }

  return `
${label} ${e.message}

${stack && stack + "\n"}`;
}
