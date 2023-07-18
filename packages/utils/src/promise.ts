export function newPromiseWithResolvers<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (value: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// similar to http://bluebirdjs.com/docs/api/promise.map.html
export async function* mapPromise<T1, T2>(
  values: Iterable<T1>,
  f: (value: T1, index: number) => PromiseLike<T2>,
  { concurrency }: { concurrency: number }
): AsyncGenerator<T2> {
  const pendings = new Map<number, Promise<[number, T2]>>();

  async function consumePending() {
    const [key, result] = await Promise.race(pendings.values());
    pendings.delete(key);
    return result;
  }

  let index = 0;
  for (const value of values) {
    if (pendings.size >= concurrency) {
      yield await consumePending();
    }
    const key = index++;
    pendings.set(
      key,
      (async () => {
        const result = await f(value, key);
        return [key, result];
      })()
    );
  }

  while (pendings.size > 0) {
    yield await consumePending();
  }
}
