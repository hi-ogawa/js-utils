import { objectHas, tinyassert } from "@hiogawa/utils";

//
// it can expose and proxy all methods as async functions
//

// TODO: support "no-reply" call?

export type TinyRpcProxy<R> = {
  [K in keyof R]: R[K] extends (...args: any[]) => any
    ? ToAsyncFn<R[K]>
    : never;
};

type ToAsyncFn<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

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
  routes: unknown;
  adapter: TinyRpcServerAdapter<T>;
}): T {
  return adapter.register(async ({ path, args }) => {
    const fn = objectHas(routes, path) && routes[path];
    tinyassert(
      typeof fn === "function",
      new TinyRpcError("invalid path", { cause: path })
    );
    return fn.apply(routes, args);
  });
}

export function proxyTinyRpc<R>({
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

// cf. https://github.com/trpc/trpc/blob/fa7f6d6b804df71d8dd15970168f7be18aeecaf2/packages/server/src/error/TRPCError.ts#L53
export class TinyRpcError extends Error {
  // employ http status convention at the core level
  public status = 500;

  // convenient api for assertion
  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  serialize() {
    return {
      message: this.message,
      stack: this.stack ?? "",
      cause: this.cause ?? null,
      status: this.status,
    };
  }

  static deserialize(e: unknown): TinyRpcError {
    tinyassert(objectHas(e, "message") && typeof e.message === "string");
    tinyassert(objectHas(e, "stack") && typeof e.stack === "string");
    tinyassert(objectHas(e, "cause"));
    tinyassert(objectHas(e, "status") && typeof e.status === "number");
    return Object.assign(new TinyRpcError(), e);
  }

  static fromUnknown(e: unknown): TinyRpcError {
    if (e instanceof TinyRpcError) {
      return e;
    }
    const err = new TinyRpcError("unknown", { cause: e });
    if (objectHas(e, "message") && typeof e.message === "string") {
      err.message = e.message;
    }
    return err;
  }
}
