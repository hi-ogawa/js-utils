export function assertUnreachable(value: never): never {
  throw new Error("assertUnreachable", { cause: value });
}

// convenient typing for array.filter(typedBoolean) (cf. https://github.com/microsoft/TypeScript/issues/31164)
export const typedBoolean = Boolean as unknown as <T>(
  value: T
) => value is Exclude<T, false | 0 | "" | null | undefined>;

// traverse Error.cause chain
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
