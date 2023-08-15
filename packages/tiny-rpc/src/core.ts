import { tinyassert } from "@hiogawa/utils";

//
// uni-directional version of https://github.com/antfu/birpc
//

export type TinyRpcRoutes2 = Record<string, (...args: any[]) => any>;

export type TinyRpcRoutesAsync2<R extends TinyRpcRoutes2> = {
  [K in keyof R]: (
    ...args: Parameters<R[K]>
  ) => Promise<Awaited<ReturnType<R[K]>>>;
};

export type TinyRpcPayload = { path: string; args: unknown[] };

export type TinyRpcServerAdapter<T> = {
  on: (invokeRoute: (data: TinyRpcPayload) => unknown) => T;
};

export type TinyRpcClientAdapter = {
  post: (data: TinyRpcPayload) => unknown;
};

export function exposeTinyRpc<T = void>({
  routes,
  adapter,
}: {
  routes: TinyRpcRoutes2;
  adapter: TinyRpcServerAdapter<T>;
}): T {
  return adapter.on(({ path, args }) => {
    const fn = routes[path];
    tinyassert(fn, `invalid path '${path}'`);
    fn(...args);
  });
}

export function proxyTinyRpc<R extends TinyRpcRoutes2>({
  adapter,
}: {
  adapter: TinyRpcClientAdapter;
}): TinyRpcRoutesAsync2<R> {
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
