import { tinyassert } from "@hiogawa/utils";

//
// server
//

export type TinyRpcRoutes = Record<string, (() => any) | ((input: any) => any)>;

// compatible with hattip's RequestHandler
// it returns `undefined` when `url.pathname` doesn't match `endpoint`
type TinyRpcHandler = (ctx: {
  url: URL;
  request: Request;
}) => Promise<Response | undefined>;

export function createTinyRpcHandler({
  endpoint,
  routes,
  transformer = noopTransformer,
  onError,
}: {
  endpoint: string;
  routes: TinyRpcRoutes;
  transformer?: Transformer;
  onError?: (e: unknown) => void;
}): TinyRpcHandler {
  const inner: TinyRpcHandler = async ({ url, request }) => {
    if (!url.pathname.startsWith(endpoint)) {
      return;
    }
    assertByCode(request.method === "POST", "METHOD_NOT_SUPPORTED");
    const path = url.pathname.slice(endpoint.length + 1);
    const fn = routes[path];
    assertByCode(fn, "NOT_FOUND");

    const requestJson = transformer.deserialize(await request.json());
    tinyassert(requestJson);
    tinyassert(typeof requestJson === "object");

    // TODO: helper to integrate zod error? (currently 500 but it should be 400?)
    const output = await fn((requestJson as any).input);
    return new Response(JSON.stringify(transformer.serialize({ output })), {
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  };

  const wrapper: typeof inner = async (...args) => {
    try {
      return await inner(...args);
    } catch (e) {
      onError?.(e);
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
  transformer = noopTransformer,
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
            body: JSON.stringify(transformer.serialize({ input })),
            headers: {
              "content-type": "application/json; charset=utf-8",
              ...headers?.(),
            },
          });
          if (!response.ok) {
            await throwErrorResponse(response);
          }

          const responseJson = transformer.deserialize(await response.json());
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
  serialize: (v: unknown) => unknown;
  deserialize: (v: unknown) => unknown;
}

const noopTransformer: Transformer = {
  serialize: (v) => v,
  deserialize: (v) => v,
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

  static fromCode(code: keyof typeof ERROR_STATUS_MAP) {
    const e = new TinyRpcError(code);
    e.status = ERROR_STATUS_MAP[code];
    return e;
  }

  static fromUnknown(eRaw: unknown) {
    const e = TinyRpcError.fromCode("INTERNAL_SERVER_ERROR");
    e.cause = eRaw;
    if (eRaw instanceof Error) {
      e.message = eRaw.message;
    }
    return e;
  }
}

function assertByCode<T>(
  value: T,
  code: keyof typeof ERROR_STATUS_MAP
): asserts value {
  if (!value) {
    throw TinyRpcError.fromCode(code);
  }
}

function createErrorResponse(eRaw: unknown) {
  const e =
    eRaw instanceof TinyRpcError ? eRaw : TinyRpcError.fromUnknown(eRaw);
  const { message, status, cause } = e;
  return new Response(
    JSON.stringify({
      message,
      status,
      // TODO: "cause" not necessarily serializable?
      cause,
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
