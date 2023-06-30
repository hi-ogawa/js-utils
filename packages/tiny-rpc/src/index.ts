import { tinyassert } from "@hiogawa/utils";

//
// server
//

// TODO: restrict to zero or one argument?
export type TinyRpcRoutes = Record<string, (...args: any[]) => any>;

export function createTinyRpcHandler({
  endpoint,
  routes,
}: {
  endpoint: string;
  routes: TinyRpcRoutes;
}) {
  return async ({ url, request }: { url: URL; request: Request }) => {
    tinyassert(url.pathname.startsWith(endpoint));
    tinyassert(request.method === "POST");

    const path = url.pathname.slice(endpoint.length + 1);
    const fn = routes[path];
    tinyassert(fn);

    const requestJson = await request.json();
    tinyassert(requestJson);
    tinyassert(typeof requestJson === "object");

    const output = await fn(requestJson.input);
    return new Response(JSON.stringify({ output }), {
      headers: {
        "content-type": "application/json",
      },
    });
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
}: {
  endpoint: string;
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
            body: JSON.stringify({ input }),
            headers: {
              "content-type": "application/json",
            },
          });
          tinyassert(response.ok);

          const responseJson = await response.json();
          tinyassert(responseJson);
          tinyassert(typeof responseJson === "object");

          return responseJson.output;
        };
      },
    }
  ) as any;
}
