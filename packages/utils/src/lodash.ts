import { safeFunctionCast } from "./misc";

//
// lodash-like utilities
//

// TODO: put always `readonly` for array arguments?

export function range(start: number, end?: number): number[] {
  if (typeof end === "undefined") {
    return Array.from(Array(Math.max(start, 0)), (_, i) => i);
  }
  return Array.from(Array(Math.max(end - start, 0)), (_, i) => i + start);
}

export function sortBy<T>(ls: T[], ...keyFns: ((x: T) => any)[]): T[] {
  return sortByMap(ls, (x) => keyFns.map((f) => f(x)), arrayCompareFn);
}

// for example, this can be used to sort strings with separators
export function sortByArray<T, U>(ls: T[], keysFn: (v: T) => U[]) {
  return sortByMap(ls, keysFn, arrayCompareFn);
}

// aka. lodash's chunk
export function splitByChunk<T>(ls: readonly T[], size: number): T[][] {
  // guard nonsense cases, which could end up infinite loop below
  if (!(Number.isInteger(size) && size > 0)) {
    return [];
  }
  let result: T[][] = [];
  for (let i = 0; i < ls.length; i += size) {
    result.push(ls.slice(i, i + size));
  }
  return result;
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
  f: (v: V, k: K) => K2,
): Map<K2, V> {
  return new Map([...map].map(([k, v]) => [f(v, k), v]));
}

export function mapValues<K, V, V2>(
  map: Map<K, V>,
  f: (v: V, k: K) => V2,
): Map<K, V2> {
  return new Map([...map].map(([k, v]) => [k, f(v, k)]));
}

export function mapGroupBy<T, K, V>(
  ls: T[],
  keyFn: (v: T) => K,
  valueFn: (vs: T[], k: K) => V,
) {
  return mapValues(groupBy(ls, keyFn), valueFn);
}

export function pickBy<K, V>(
  map: Map<K, V>,
  f: (v: V, k: K) => boolean,
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
  ls2: readonly T2[],
): [T1, T2][] {
  return range(Math.min(ls1.length, ls2.length)).map((i) => [ls1[i], ls2[i]]);
}

export function zipMax<T1, T2>(
  ls1: readonly T1[],
  ls2: readonly T2[],
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
  let result: ReturnType<F>;
  let called = false;
  return safeFunctionCast<F>(function (this: unknown, ...args) {
    if (!called) {
      result = f.apply(this, args);
      called = true;
    }
    return result;
  });
}

export function memoize<F extends (...args: any[]) => any>(
  f: F,
  options?: {
    keyFn?: (...args: Parameters<F>) => unknown;
    cache?: {
      get(k: unknown): ReturnType<F> | undefined;
      set(k: unknown, v: ReturnType<F>): void;
    };
  },
): F {
  // by default, use 1st argument as a cache key which is same as lodash
  const keyFn = options?.keyFn ?? ((...args) => args[0]);
  const cache = options?.cache ?? new Map<unknown, ReturnType<F>>();
  return safeFunctionCast<F>(function (this: unknown, ...args) {
    const key = keyFn(...args);
    // avoid `has/get` since they might not be atomic for some cache (e.g. ttl cache).
    // however, this logic means `undefined` value will not be cached.
    const value = cache.get(key);
    if (typeof value !== "undefined") {
      return value;
    }
    const newValue = f.apply(this, args);
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
  },
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
  ms: number,
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
// famously unsound but too convenient for string enum/union based record
// https://github.com/microsoft/TypeScript/pull/12253#issuecomment-263132208
//

export function objectPick<T extends object, K extends keyof T>(
  o: T,
  keys: K[],
): Pick<T, K> {
  return objectPickBy(o, (_v, k) => keys.includes(k)) as any;
}

export function objectOmit<T extends object, K extends keyof T>(
  o: T,
  keys: K[],
): Omit<T, K> {
  return objectPickBy(o, (_v, k) => !keys.includes(k)) as any;
}

export function objectPickBy<K extends PropertyKey, V>(
  o: Record<K, V>,
  f: (v: V, k: K) => boolean,
): Record<K, V> {
  return objectFromEntries(objectEntries(o).filter(([k, v]) => f(v, k as any)));
}

export function objectOmitBy<K extends PropertyKey, V>(
  o: Record<K, V>,
  f: (v: V, k: K) => boolean,
): Record<K, V> {
  return objectPickBy(o, (v, k) => !f(v, k));
}

export function objectKeys<T extends object>(o: T): (keyof T)[] {
  return Object.keys(o) as any;
}

export function objectEntries<T extends object>(o: T): ObjectEntry<T>[] {
  return Object.entries(o) as any;
}

type ObjectEntry<T extends object> = { [K in keyof T]: [K, T[K]] }[keyof T];

export function objectFromEntries<K extends PropertyKey, V>(
  kvs: [K, V][],
): Record<K, V> {
  return Object.fromEntries(kvs) as any;
}
function objectMapEntries<T extends object, K2 extends PropertyKey, V2>(
  o: T,
  f: (kv: ObjectEntry<T>) => [K2, V2],
): Record<K2, V2> {
  return objectFromEntries(objectEntries(o).map((kv) => f(kv)));
}

export function objectMapValues<T extends object, V>(
  o: T,
  f: (v: T[keyof T], k: keyof T) => V,
): { [k in keyof T]: V } {
  return objectMapEntries(o, ([k, v]) => [k, f(v, k)]);
}

export function objectMapKeys<T extends object, K extends PropertyKey>(
  o: T,
  f: (v: T[keyof T], k: keyof T) => K,
): Record<K, T[keyof T]> {
  return objectMapEntries(o, ([k, v]) => [f(v, k), v]);
}

export function objectHas<Prop extends keyof any>(
  v: unknown,
  prop: Prop,
): v is { [prop in Prop]: unknown } {
  return Boolean(v && typeof v === "object" && prop in v);
}

//
// internal
//

function sortByMap<T, V>(
  ls: T[],
  mapFn: (x: T) => V,
  compareFn: (x: V, y: V) => number,
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

function arrayCompareFn(xs: unknown[], ys: unknown[]): number {
  const length = Math.min(xs.length, ys.length);
  for (let i = 0; i < length; i++) {
    const result = anyCompareFn(xs[i], ys[i]);
    if (result !== 0) {
      return result;
    }
  }
  return anyCompareFn(xs.length, ys.length);
}
