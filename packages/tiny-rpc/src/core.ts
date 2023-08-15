import { tinyassert } from "@hiogawa/utils";

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
  return adapter.on(async ({ path, args }) => {
    const fn = routes[path];
    tinyassert(fn, new RpcError("invalid path", { cause: path }));
    return await fn(...args);
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
        tinyassert(
          typeof path === "string",
          new RpcError("invalid path", { cause: path })
        );
        return async (...args: unknown[]) => {
          // automatically wrap all client error as RpcError
          try {
            return await adapter.post({ path, args });
          } catch (e) {
            throw RpcError.fromUnknown(e);
          }
        };
      },
    }
  ) as any;
}

//
// error
//

export class RpcError extends Error {
  // employ http status convention
  public status = 500;

  // convenient api for assertion
  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  serialize() {
    return {
      message: this.message,
      stack: this.stack,
      cause: this.cause,
      status: this.status,
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
      if ("status" in e && typeof e.status === "number") {
        err.status = e.status;
      }
    }
    return err;
  }
}
