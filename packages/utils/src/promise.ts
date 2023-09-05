// TODO: how is it different from this? https://github.com/remix-run/remix/blob/1d3d86eaceb7784c56d34d963310ecbcb8c9637a/packages/remix-dev/channel.ts#L1-L2
export function newPromiseWithResolvers<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (value: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// somewhat more flexible variant of http://bluebirdjs.com/docs/api/promise.map.html
export async function* mapToAsyncGenerator<T1, T2>(
  values: Iterable<T1>,
  f: (value: T1, index: number) => T2 | PromiseLike<T2>,
  { concurrency }: { concurrency: number },
): AsyncGenerator<T2> {
  const pendings: Promise<() => T2>[] = [];

  let index = 0;
  for (const value of values) {
    if (pendings.length >= concurrency) {
      // TODO: find and yield other resolved promises after Promise.race?
      yield (await Promise.race(pendings))();
    }

    const promise = (async () => {
      const result = await f(value, index++);
      return () => {
        // synchronously cleanup itself then return
        pendings.splice(pendings.indexOf(promise), 1);
        return result;
      };
    })();
    pendings.push(promise);
  }

  while (pendings.length > 0) {
    yield (await Promise.race(pendings))();
  }
}

export async function arrayFromAsyncGenerator<T>(
  generator: AsyncGenerator<T>,
): Promise<T[]> {
  const result: T[] = [];
  for await (const v of generator) {
    result.push(v);
  }
  return result;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}
