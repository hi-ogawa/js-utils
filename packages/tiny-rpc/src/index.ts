import { tinyassert } from "@hiogawa/utils";

//
// server
//

export type TinyRpcRoutes = Record<string, (() => any) | ((input: any) => any)>;

export function createTinyRpcHandler({
  endpoint,
  routes,
  transformer = jsonTransformer,
}: {
  endpoint: string;
  routes: TinyRpcRoutes;
  transformer?: Transformer;
}) {
  return async ({ url, request }: { url: URL; request: Request }) => {
    tinyassert(url.pathname.startsWith(endpoint));
    tinyassert(request.method === "POST");

    const path = url.pathname.slice(endpoint.length + 1);
    const fn = routes[path];
    tinyassert(fn);

    const requestJson = transformer.deserialize(await request.text());
    tinyassert(requestJson);
    tinyassert(typeof requestJson === "object");

    const output = await fn((requestJson as any).input);
    return new Response(transformer.serialize({ output }));
  };
}

//
// client
//

type TinyRpcRoutesAsync<R extends TinyRpcRoutes> = {
  [K in keyof R]: (
    ...args: Parameters<R[K]>
  ) => Promise<Awaited<ReturnType<R[K]>>>;
};

export function createTinyRpcClientProxy<R extends TinyRpcRoutes>({
  endpoint,
  transformer = jsonTransformer,
}: {
  endpoint: string;
  transformer?: Transformer;
}): TinyRpcRoutesAsync<R> {
  return new Proxy(
    {},
    {
      get(_target, path, _receiver) {
        tinyassert(typeof path === "string");

        return async (input: unknown) => {
          const url = [endpoint, path].join("/");
          const response = await fetch(url, {
            method: "POST",
            body: transformer.serialize({ input }),
          });
          tinyassert(response.ok);

          const responseJson = transformer.deserialize(await response.text());
          tinyassert(responseJson);
          tinyassert(typeof responseJson === "object");

          return (responseJson as any).output;
        };
      },
    }
  ) as any;
}

//
// common
//

interface Transformer {
  serialize: (v: unknown) => string;
  deserialize: (v: string) => unknown;
}

const jsonTransformer: Transformer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};
