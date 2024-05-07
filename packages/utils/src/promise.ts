// inspired by
//   ManualPromise https://github.com/microsoft/playwright/blob/10dda30c7f417a92f782e21368fbb211a679838a/packages/playwright-core/src/utils/manualPromise.ts#L31-L38
//   createDefer https://github.com/vitest-dev/vitest/blob/9c552b6f8decb78677b20e870eb430184e0b78ea/packages/utils/src/helpers.ts#L155
//   channel https://github.com/remix-run/remix/blob/9a845b6576fbaf112161f6f97295f6dbb44d913f/packages/remix-dev/channel.ts#L1-L2
export interface ManualPromise<T> extends PromiseLike<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (value: unknown) => void;
}

export function createManualPromise<T>(): ManualPromise<T> {
  let resolve!: ManualPromise<T>["resolve"];
  let reject!: ManualPromise<T>["reject"];
  const promise = new Promise<T>((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return { promise, resolve, reject, then: promise.then.bind(promise) };
}

/** @deprecated use createManualPromise instead */
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
