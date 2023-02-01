// https://docs.python.org/3/library/collections.html#collections.defaultdict
// https://stackoverflow.com/questions/19127650/defaultdict-equivalent-in-javascript

export function defaultDict<K extends string, T>(
  defaultFactory: () => T
): Record<K, T> {
  return new Proxy<Record<K, T>>({} as any, {
    get: (target: any, p: any) => {
      if (!(p in target)) {
        target[p] = defaultFactory();
      }
      return target[p];
    },
  });
}
