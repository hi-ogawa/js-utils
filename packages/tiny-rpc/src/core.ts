import { tinyassert } from "@hiogawa/utils";

//
// uni-directional version of https://github.com/antfu/birpc
//

export type RpcRoutes = Record<string, (...args: any[]) => any>;

export type RpcRoutesAsync<R extends RpcRoutes> = {
  [K in keyof R]: (
    ...args: Parameters<R[K]>
  ) => Promise<Awaited<ReturnType<R[K]>>>;
};

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
    tinyassert(fn, `invalid path '${path}'`);
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
        tinyassert(typeof path === "string");
        return (...args: unknown[]) => adapter.post({ path, args });
      },
    }
  ) as any;
}
