// https://doc.rust-lang.org/std/option

export function mapOption<T, U>(
  x: T,
  f: (x: Exclude<T, undefined>) => U,
): U | undefined {
  return typeof x === "undefined" ? x : f(x as Exclude<T, undefined>);
}

/* shortcut for `undefined as T | undefined` */
export function none<T>(): T | undefined {
  return undefined;
}
