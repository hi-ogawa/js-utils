// https://stackoverflow.com/a/51321724

export class DefaultMap<K, V> extends Map<K, V> {
  constructor(private defaultFactory: () => V) {
    super();
  }

  override get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.defaultFactory());
    }
    return super.get(key)!;
  }
}
