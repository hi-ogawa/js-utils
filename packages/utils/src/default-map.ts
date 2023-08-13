import { sortBy } from "./lodash";

export class DefaultMap<K, V> extends Map<K, V> {
  constructor(
    private defaultFn: (key: K) => V,
    entries?: Iterable<readonly [K, V]>
  ) {
    super(entries);
  }

  override get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultFn(key));
    }
    return super.get(key)!;
  }
}

export class UncheckedMap<K, V> extends DefaultMap<K, V> {
  constructor(entries?: Iterable<readonly [K, V]>) {
    super((key) => {
      throw new Error("UncheckedMap", { cause: { key } });
    }, entries);
  }
}

export class HashKeyMap<K, V> {
  private map = new Map<string, [k: K, v: V]>();

  constructor(private keyFn: (key: K) => string = defaultKeyFn) {}

  get(key: K): V | undefined {
    return this.map.get(this.keyFn(key))?.[1];
  }

  set(key: K, value: V) {
    this.map.set(this.keyFn(key), [key, value]);
    return this;
  }

  delete(key: K): boolean {
    return this.map.delete(this.keyFn(key));
  }

  has(key: K): boolean {
    return this.map.has(this.keyFn(key));
  }

  clear() {
    this.map.clear();
  }

  entries() {
    return this.map.values();
  }
}

export class HashKeyDefaultMap<K extends object, V> extends HashKeyMap<K, V> {
  constructor(
    private defaultFn: (key: K) => V,
    keyFn: (key: K) => string = defaultKeyFn
  ) {
    super(keyFn);
  }

  override get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultFn(key));
    }
    return super.get(key)!;
  }
}

function defaultKeyFn(v: any): string {
  // shallow sort by key as a cheap normalization
  return JSON.stringify(sortBy(Object.entries(v), ([k]) => k));
}

export function memoize<F extends (...args: any[]) => any>(f: F): F {
  const map = new HashKeyDefaultMap<Parameters<F>, ReturnType<F>>(
    f,
    JSON.stringify
  );
  return ((...args: Parameters<F>) => map.get(args)) as F;
}
