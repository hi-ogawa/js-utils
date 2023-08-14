import { safeFunctionCast } from "./misc";

//
// lodash-like utilities
//

export function range(start: number, end?: number): number[] {
  if (typeof end === "undefined") {
    return Array.from(Array(start), (_, i) => i);
  }
  return Array.from(Array(end - start), (_, i) => i + start);
}

export function sortBy<T>(ls: T[], ...keyFns: ((x: T) => any)[]): T[] {
  return sortByMap(ls, (x) => keyFns.map((f) => f(x)), arrayCompareFn);
}

export function groupBy<T, K>(ls: T[], f: (x: T) => K): Map<K, T[]> {
  const result = new Map<K, T[]>();
  for (const x of ls) {
    const y = f(x);
    if (!result.has(y)) {
      result.set(y, []);
    }
    result.get(y)!.push(x);
  }
  return result;
}

export function mapKeys<K, V, K2>(
  map: Map<K, V>,
  f: (v: V, k: K) => K2
): Map<K2, V> {
  return new Map([...map].map(([k, v]) => [f(v, k), v]));
}

export function mapValues<K, V, V2>(
  map: Map<K, V>,
  f: (v: V, k: K) => V2
): Map<K, V2> {
  return new Map([...map].map(([k, v]) => [k, f(v, k)]));
}

export function mapGroupBy<T, K, V>(
  ls: T[],
  keyFn: (v: T) => K,
  valueFn: (vs: T[], k: K) => V
) {
  return mapValues(groupBy(ls, keyFn), valueFn);
}

export function pickBy<K, V>(
  map: Map<K, V>,
  f: (v: V, k: K) => boolean
): Map<K, V> {
  return new Map([...map].filter(([k, v]) => f(v, k)));
}

export function uniq<T>(ls: T[]): T[] {
  return Array.from(new Set(ls));
}

export function uniqBy<T>(ls: T[], f: (x: T) => unknown): T[] {
  const ys = new Set<unknown>();
  return ls.filter((x) => {
    const y = f(x);
    if (ys.has(y)) {
      return false;
    }
    ys.add(y);
    return true;
  });
}

export function partition<T>(ls: T[], f: (x: T) => boolean): [T[], T[]] {
  const result: [T[], T[]] = [[], []];
  for (const x of ls) {
    result[f(x) ? 0 : 1].push(x);
  }
  return result;
}

export function zip<T1, T2>(
  ls1: readonly T1[],
  ls2: readonly T2[]
): [T1, T2][] {
  return range(Math.min(ls1.length, ls2.length)).map((i) => [ls1[i], ls2[i]]);
}

export function zipMax<T1, T2>(
  ls1: readonly T1[],
  ls2: readonly T2[]
): [T1 | undefined, T2 | undefined][] {
  return range(Math.max(ls1.length, ls2.length)).map((i) => [ls1[i], ls2[i]]);
}

export function difference<T>(ls1: readonly T[], ls2: readonly T[]): T[] {
  const set2 = new Set(ls2);
  return ls1.filter((e) => !set2.has(e));
}

export function intersection<T>(ls1: readonly T[], ls2: readonly T[]): T[] {
  if (ls1.length > ls2.length) {
    [ls1, ls2] = [ls2, ls1];
  }
  const set2 = new Set(ls2);
  return ls1.filter((e) => set2.has(e));
}

//
// string
//

export function capitalize(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export function splitFirst(s: string, sep: string): [string, string] {
  let i = s.indexOf(sep);
  if (i === -1) {
    i = s.length;
  }
  return [s.slice(0, i), s.slice(i + sep.length)];
}

export function splitLast(s: string, sep: string): [string, string] {
  let i = s.lastIndexOf(sep);
  if (i === -1) {
    i = s.length;
  }
  return [s.slice(0, i), s.slice(i + sep.length)];
}

export function isNil<T>(value: T): value is T & (null | undefined) {
  return value === null || typeof value === "undefined";
}

export function isNotNil<T>(value: T): value is NonNullable<T> {
  return !isNil(value);
}

// TODO: handle error?
export function once<F extends (...args: any[]) => any>(f: F): F {
  let result: unknown;
  let called = false;
  function wrapper(...args: any[]) {
    if (!called) {
      result = f(...args);
      called = true;
    }
    return result;
  }
  return wrapper as F;
}

export function memoize<F extends (...args: any[]) => any>(
  f: F,
  options?: {
    keyFn?: (...args: Parameters<F>) => unknown;
    cache?: Pick<Map<unknown, ReturnType<F>>, "get" | "set">;
  }
): F {
  // by default, use 1st argument as a cache key which is same as lodash
  const keyFn = options?.keyFn ?? ((...args) => args[0]);
  const cache = options?.cache ?? new Map<unknown, ReturnType<F>>();
  return safeFunctionCast<F>((...args) => {
    const key = keyFn(...args);
    // avoid `has/get` since they might not be atomic (e.g. ttl cache)
    // however, this logic means `undefined` value will not be cached.
    const value = cache.get(key);
    if (typeof value !== "undefined") {
      return value;
    }
    const newValue = f(...args);
    cache.set(key, newValue);
    return newValue;
  });
}

// utils is not supposed to depend on lib.dom or @types/node. so for now we manual add required typings.
declare function setTimeout(callback: () => void, timeout: number): number;
declare function clearTimeout(subscription: number): number;

export function debounce<F extends (...args: any[]) => void>(
  f: F,
  ms: number,
  options?: {
    // extra callback to easily implement pending state (cf. useDebounce in utils-react)
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
  }
): F & { cancel: () => void } {
  let subscription: number | undefined;

  function wrapper(this: unknown, ...args: unknown[]) {
    cancel();
    subscription = setTimeout(() => {
      subscription = undefined;
      f.apply(this, args);
      options?.onFinish?.();
    }, ms);
    options?.onStart?.();
  }

  function cancel() {
    if (typeof subscription !== "undefined") {
      clearTimeout(subscription);
      subscription = undefined;
    }
    options?.onCancel?.();
  }

  return Object.assign(wrapper, { cancel }) as any;
}

export function delay<F extends (...args: any[]) => void>(
  f: F,
  ms: number
): F & { cancel: () => void } {
  const subscriptions = new Set<number>();

  function wrapper(this: unknown, ...args: unknown[]) {
    const sub = setTimeout(() => {
      subscriptions.delete(sub);
      f.apply(this, args);
    }, ms);
    subscriptions.add(sub);
  }

  function cancel() {
    for (const sub of subscriptions) {
      clearTimeout(sub);
    }
    subscriptions.clear();
  }

  return Object.assign(wrapper, { cancel }) as any;
}

//
// unsafe but convenient plain object key manipulation
// https://github.com/microsoft/TypeScript/pull/12253#issuecomment-263132208
//

// TODO: better DX with objectPick(o, ...keys: K[]) ?
export function objectPick<T extends object, K extends keyof T>(
  o: T,
  keys: K[]
): Pick<T, K> {
  return objectPickBy(o, (_v, k) => keys.includes(k)) as any;
}

export function objectOmit<T extends object, K extends keyof T>(
  o: T,
  keys: K[]
): Omit<T, K> {
  return objectPickBy(o, (_v, k) => !keys.includes(k)) as any;
}

export function objectPickBy<K extends PropertyKey, V>(
  o: Record<K, V>,
  f: (v: V, k: K) => boolean
): Record<K, V> {
  return Object.fromEntries(
    Object.entries<V>(o).filter(([k, v]) => f(v, k as any))
  ) as any;
}

export function objectOmitBy<K extends PropertyKey, V>(
  o: Record<K, V>,
  f: (v: V, k: K) => boolean
): Record<K, V> {
  return objectPickBy(o, (v, k) => !f(v, k));
}

export function objectKeys<T extends object>(o: T): (keyof T)[] {
  return Object.keys(o) as any;
}

//
// internal
//

function sortByMap<T, V>(
  ls: T[],
  mapFn: (x: T) => V,
  compareFn: (x: V, y: V) => number
): T[] {
  const mapped = ls.map(mapFn);

  function indexCompareFn(i: number, j: number): number {
    return compareFn(mapped[i]!, mapped[j]!);
  }

  return range(ls.length)
    .sort(indexCompareFn)
    .map((i) => ls[i]!);
}

function anyCompareFn(x: any, y: any): number {
  return x < y ? -1 : x > y ? 1 : 0;
}

function arrayCompareFn(xs: any[], ys: any[]): number {
  for (let i = 0; i < xs.length; i++) {
    const result = anyCompareFn(xs[i], ys[i]);
    if (result !== 0) {
      return result;
    }
  }
  return 0;
}
