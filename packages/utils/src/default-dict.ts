// https://docs.python.org/3/library/collections.html#collections.defaultdict
// https://stackoverflow.com/questions/19127650/defaultdict-equivalent-in-javascript

export function defaultDict<T>(defaultFactory: () => T): Record<string, T> {
  return new Proxy<Record<string, T>>(
    {},
    {
      get: (target, p: string) => {
        if (!(p in target)) {
          target[p] = defaultFactory();
        }
        return target[p];
      },
    }
  );
}
