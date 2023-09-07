export function assertUnreachable(value: never): never {
  throw new Error("assertUnreachable", { cause: value });
}

// convenient typing for array.filter(typedBoolean) (cf. https://github.com/microsoft/TypeScript/issues/31164)
export const typedBoolean = Boolean as unknown as <T>(
  value: T
) => value is Exclude<T, false | 0 | "" | null | undefined>;

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

/** silence "error TSTS2322" but practically this is safer and more convenient than resorting to `any` */
export function safeFunctionCast<F extends (...args: any[]) => any>(
  f: (...args: Parameters<F>) => ReturnType<F>
): F {
  // silence type error:
  //   error TS2322: Type '(...args: Parameters<F>) => ReturnType<F>' is not assignable to type 'F'.
  //   '(...args: Parameters<F>) => ReturnType<F>' is assignable to the constraint of type 'F', but 'F' could be instantiated with a different subtype of constraint '(...args: any[]) => any'.
  return f as any;
}

// helpers for paring addEventListener/removeEventListener where listener argument is inferred based on EventMap
export function subscribeEventListenerFactory<EventMap>(target: {
  addEventListener(
    eventType: string,
    listener: (event: any) => unknown
  ): unknown;
  removeEventListener(
    eventType: string,
    listener: (event: any) => unknown
  ): unknown;
}) {
  return function subscribeEventListener<K extends keyof EventMap & string>(
    k: K,
    listener: (e: EventMap[K]) => unknown
  ) {
    target.addEventListener(k, listener);
    return () => {
      target.removeEventListener(k, listener);
    };
  };
}
