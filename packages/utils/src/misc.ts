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

// similar convenience as z.enum but supports any key (number | string | symbol)
// cf. https://github.com/colinhacks/zod/blob/cfbc7b3f6714ced250dd4053822faf472bf1828e/src/types.ts#L3958
export function arrayToEnum<
  T extends keyof any,
  Ts extends Readonly<[T, ...T[]]>
>(
  values: Ts
): {
  [K in Ts[number]]: K;
} {
  return Object.fromEntries(values.map((v) => [v, v])) as any;
}

// `Array.prototype.includes` checks argument type and doesn't function as type guard
export function includesGuard<T>(ls: readonly T[], v: unknown): v is T {
  return ls.includes(v as T);
}

export function* enumerate<T>(ls: Iterable<T>): Generator<[number, T]> {
  let i = 0;
  for (const v of ls) {
    yield [i++, v];
  }
}
