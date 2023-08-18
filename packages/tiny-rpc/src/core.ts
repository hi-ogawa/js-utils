import { tinyassert } from "@hiogawa/utils";

//
// TinyRpc routes schema
//

export type TinyRpcRoutes = Record<string, (...args: any[]) => any>;

export type TinyRpcProxy<R extends TinyRpcRoutes> = {
  [K in keyof R]: (
    ...args: Parameters<R[K]>
  ) => Promise<Awaited<ReturnType<R[K]>>>;
};

//
// Adapter interface
//

export type TinyRpcPayload = { path: string; args: unknown[] };

export type TinyRpcServerAdapter<T> = {
  register: (invokeRoute: (data: TinyRpcPayload) => unknown) => T;
};

export type TinyRpcClientAdapter = {
  send: (data: TinyRpcPayload) => unknown;
};

export function exposeTinyRpc<T>({
  routes,
  adapter,
}: {
  routes: TinyRpcRoutes;
  adapter: TinyRpcServerAdapter<T>;
}): T {
  return adapter.register(async ({ path, args }) => {
    const fn = routes[path];
    tinyassert(fn, new TinyRpcError("invalid path", { cause: path }));
    return await fn(...args);
  });
}

export function proxyTinyRpc<R extends TinyRpcRoutes>({
  adapter,
}: {
  adapter: TinyRpcClientAdapter;
}): TinyRpcProxy<R> {
  return new Proxy(
    {},
    {
      get(_target, path, _receiver) {
        tinyassert(
          typeof path === "string",
          new TinyRpcError("invalid path", { cause: path })
        );
        return async (...args: unknown[]) => {
          // automatically wrap all client error as RpcError
          try {
            return await adapter.send({ path, args });
          } catch (e) {
            throw TinyRpcError.fromUnknown(e);
          }
        };
      },
    }
  ) as any;
}

//
// error
//

export class TinyRpcError extends Error {
  // employ http status convention
  public status = 500;

  // convenient api for assertion
  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  // TODO: allow obfuscating server error detail?
  serialize() {
    return {
      name: "TinyRpcError",
      message: this.message,
      stack: this.stack,
      cause: this.cause,
      status: this.status,
    };
  }

  static fromUnknown(e: unknown): TinyRpcError {
    if (e instanceof TinyRpcError) {
      return e;
    }
    // cf. https://github.com/trpc/trpc/blob/fa7f6d6b804df71d8dd15970168f7be18aeecaf2/packages/server/src/error/TRPCError.ts#L53
    const err = new TinyRpcError("unknown", { cause: e });
    if (e && typeof e === "object") {
      if ("message" in e && typeof e.message === "string") {
        err.message = e.message;
      }
      // copy others only when reviving serialized TinyRpcError
      if ("name" in e && e.name === "TinyRpcError") {
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
    }
    return err;
  }
}
