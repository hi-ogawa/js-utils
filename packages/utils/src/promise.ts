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
export async function mapPromise<T1, T2>(
  ls: Iterable<T1>,
  f: (v: T1) => PromiseLike<T2>,
  { concurrency }: { concurrency: number }
): Promise<T2[]> {
  const queue = new AsyncTaskQueue<T2>({ concurrency });
  for (const v of ls) {
    await queue.put(() => f(v));
  }
  await queue.join();
  return queue.results;
}

export async function* mapPromise2<T1, T2>(
  ls: Iterable<T1>,
  f: (v: T1) => PromiseLike<T2>,
  { concurrency }: { concurrency: number }
): AsyncGenerator<T2> {
  const pendings: Promise<[number, T2]>[] = [];

  async function consumePending() {
    const [iDone, result] = await Promise.any(pendings);
    pendings.splice(iDone, 1);
    return result;
  }

  for (const v of ls) {
    if (pendings.length >= concurrency) {
      yield await consumePending();
    }
    const iPending = pendings.length;
    pendings.push(
      (async () => {
        const result = await f(v);
        return [iPending, result];
      })()
    );
  }

  while (pendings.length > 0) {
    yield await consumePending();
  }
}

class AsyncTaskQueue<T> {
  pending: Promise<number>[] = [];
  results: T[] = [];

  constructor(private options: { concurrency: number }) {}

  async put(fn: () => PromiseLike<T>) {
    if (this.pending.length >= this.options.concurrency) {
      await this.consumePending();
    }

    const iResult = this.results.length;
    this.results[iResult] = undefined!;

    const iPending = this.pending.length;
    console.log("== put", { iResult, iPending });
    this.pending[iPending] = (async () => {
      this.results[iResult] = await fn();
      return iPending;
    })();
  }

  private async consumePending() {
    const iPending = await Promise.any(this.pending);
    console.log("== consumePending", { iPending });
    this.pending.splice(iPending, 1);
  }

  async join() {
    while (this.pending.length > 0) {
      await this.consumePending();
    }
  }
}
