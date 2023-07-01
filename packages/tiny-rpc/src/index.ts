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
  const inner = async ({ url, request }: { url: URL; request: Request }) => {
    assertCode(url.pathname.startsWith(endpoint), "NOT_FOUND");
    assertCode(request.method === "POST", "METHOD_NOT_SUPPORTED");

    const path = url.pathname.slice(endpoint.length + 1);
    const fn = routes[path];
    assertCode(fn, "NOT_FOUND");

    const requestJson = transformer.deserialize(await request.text());
    tinyassert(requestJson);
    tinyassert(typeof requestJson === "object");

    // TODO: helper to integrate zod error? (currently 500 but it should be 400?)
    const output = await fn((requestJson as any).input);
    return new Response(transformer.serialize({ output }));
  };

  const wrapper: typeof inner = async (...args) => {
    try {
      return await inner(...args);
    } catch (e) {
      return createErrorResponse(e);
    }
  };
  return wrapper;
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
  headers,
  fetch: fetchImpl = fetch,
}: {
  endpoint: string;
  transformer?: Transformer;
  headers?: () => Record<string, string>;
  fetch?: typeof fetch;
}): TinyRpcRoutesAsync<R> {
  return new Proxy(
    {},
    {
      get(_target, path, _receiver) {
        tinyassert(typeof path === "string");

        return async (input: unknown) => {
          const url = [endpoint, path].join("/");
          const response = await fetchImpl(url, {
            method: "POST",
            body: transformer.serialize({ input }),
            headers: headers?.(),
          });
          if (!response.ok) {
            await throwErrorResponse(response);
          }

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

//
// error
//

// cf. https://github.com/trpc/trpc/blob/29c3d666a1984d870c8fb826b1fb619087145f93/packages/server/src/http/getHTTPStatusCode.ts#L9-L27
const ERROR_STATUS_MAP = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  INTERNAL_SERVER_ERROR: 500,
};

export class TinyRpcError extends Error {
  public status = 500;
}

function assertCode<T>(
  value: T,
  code: keyof typeof ERROR_STATUS_MAP
): asserts value {
  if (!value) {
    const e = new TinyRpcError(code);
    e.status = ERROR_STATUS_MAP[code];
    throw e;
  }
}

function createErrorResponse(eRaw: unknown) {
  let e: TinyRpcError;
  if (eRaw instanceof TinyRpcError) {
    e = eRaw;
  } else {
    e = new TinyRpcError();
    e.message = eRaw instanceof Error ? eRaw.message : "INTERNAL_SERVER_ERROR";
    e.cause = eRaw;
  }
  const { message, status, cause } = e;
  return new Response(
    JSON.stringify({
      message,
      status,
      // TODO: "cause" not necessarily serializable?
      cause: cause ? "[REDUCTED]" : "",
    }),
    {
      status,
      headers: { "content-type": "application/json" },
    }
  );
}

async function throwErrorResponse(res: Response): Promise<never> {
  const resJson = await res.json();
  throw Object.assign(new TinyRpcError(), resJson);
}
