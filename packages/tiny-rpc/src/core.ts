// TODO: rename all with prefix "TinyRpc" after removing old ones

//
// TinyRpc routes schema
//

export type RpcRoutes = Record<string, (...args: any[]) => any>;

export type RpcRoutesAsync<R extends RpcRoutes> = {
  [K in keyof R]: (
    ...args: Parameters<R[K]>
  ) => Promise<Awaited<ReturnType<R[K]>>>;
};

//
// Adapter interface
//

export type RpcPayload = { path: string; args: unknown[] };

export type RpcServerAdapter<T> = {
  on: (invokeRoute: (data: RpcPayload) => unknown) => T;
};

export type RpcClientAdapter = {
  post: (data: RpcPayload) => unknown;
};

export function exposeRpc<T>({
  routes,
  adapter,
}: {
  routes: RpcRoutes;
  adapter: RpcServerAdapter<T>;
}): T {
  return adapter.on(({ path, args }) => {
    const fn = routes[path];
    if (!fn) {
      throw new RpcError(`path not found`, { cause: path });
    }
    return fn(...args);
  });
}

export function proxyRpc<R extends RpcRoutes>({
  adapter,
}: {
  adapter: RpcClientAdapter;
}): RpcRoutesAsync<R> {
  return new Proxy(
    {},
    {
      get(_target, path, _receiver) {
        if (typeof path !== "string") {
          throw new RpcError(`invalid path`, { cause: path });
        }
        return (...args: unknown[]) => adapter.post({ path, args });
      },
    }
  ) as any;
}

export class RpcError extends Error {
  serialize() {
    return {
      message: this.message,
      stack: this.stack,
      cause: this.cause,
    };
  }

  static fromUnknown(e: unknown): RpcError {
    if (e instanceof RpcError) {
      return e;
    }
    const err = new RpcError("unknown", { cause: e });
    if (e && typeof e === "object") {
      if ("message" in e && typeof e.message === "string") {
        err.message = e.message;
      }
      if ("stack" in e && typeof e.stack === "string") {
        err.stack = e.stack;
      }
      if ("cause" in e) {
        err.cause = e.cause;
      }
    }
    return err;
  }
}
