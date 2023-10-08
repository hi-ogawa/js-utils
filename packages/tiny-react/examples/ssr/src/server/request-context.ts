import type { RequestContext } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";

// quick-and-dirty synchronous context for `useUrl`
// cf. https://github.com/hi-ogawa/vite-plugins/blob/e3ddf3766bcf3fbd5325623acad1d46d8a71ea23/packages/demo/src/server/request-context.ts#L8-L16
class SyncLocalStorage<T> {
  private stack: T[] = [];

  run = <U>(v: T, f: () => U): U => {
    this.stack.push(v);
    try {
      return f();
    } finally {
      this.stack.pop();
    }
  };

  getStore = (): T | undefined => {
    return this.stack.at(-1);
  };
}

export const requestContextStorage = new SyncLocalStorage<RequestContext>();

export function getRequestContext() {
  const value = requestContextStorage.getStore();
  tinyassert(value, `forgot 'requestContextStorage.run'?`);
  return value;
}
