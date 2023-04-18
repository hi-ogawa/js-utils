// https://stackoverflow.com/a/51321724

export class DefaultMap<K, V> extends Map<K, V> {
  constructor(
    private defaultFactory: (key: K) => V,
    entries?: Iterable<readonly [K, V]>
  ) {
    super(entries);
  }

  override get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultFactory(key));
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
