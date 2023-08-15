import { type Result, tinyassert, wrapErrorAsync } from "@hiogawa/utils";
import { type RpcClientAdapter, RpcError, type RpcServerAdapter } from "./core";

// TODO:
// - custom (de)serializer
// - support GET version of adapter (or as options)

// compatible with hattip's RequestHandler
type RequestHandler = (ctx: {
  request: Request;
}) => Promise<Response | undefined>;

export function hattipServerAdapter(opts: {
  endpoint: string;
  onError?: (e: unknown) => void;
}): RpcServerAdapter<RequestHandler> {
  return {
    on: (invokeRoute): RequestHandler => {
      return async ({ request }) => {
        const url = new URL(request.url);
        if (!url.pathname.startsWith(opts.endpoint)) {
          return;
        }
        const result = await wrapErrorAsync(async () => {
          tinyassert(
            request.method === "POST",
            new TinyRpcHttpError("invalid method", {
              cause: request.method,
            }).setHttpStatus(405)
          );
          const path = url.pathname.slice(opts.endpoint.length + 1);
          const args = await request.json();
          return invokeRoute({ path, args });
        });
        let status = 200;
        if (!result.ok) {
          opts.onError?.(result.value);
          const e = TinyRpcHttpError.fromUnknown(result.value);
          status = e.httpStatus;
          result.value = e.serialize();
        }
        return new Response(JSON.stringify(result), {
          status,
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
      };
    },
  };
}

export function fetchClientAdapter(opts: {
  url: string;
  fetch?: (typeof globalThis)["fetch"];
}): RpcClientAdapter {
  const fetch = opts.fetch ?? globalThis.fetch;
  return {
    post: async (data) => {
      const url = [opts.url, data.path].join("/");
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data.args),
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      });
      const result: Result<unknown, unknown> = await res.json();
      if (!result.ok) {
        throw result.value;
      }
      return result.value;
    },
  };
}

// TODO: fine to move to RpcError?
export class TinyRpcHttpError extends RpcError {
  public httpStatus = 500;

  // convenience for assertion
  setHttpStatus(status: number): this {
    this.httpStatus = status;
    return this;
  }

  static override fromUnknown(e: unknown): TinyRpcHttpError {
    if (e instanceof TinyRpcHttpError) {
      return e;
    }
    const err = Object.assign(
      new TinyRpcHttpError(),
      super.fromUnknown(e).serialize()
    );
    // ad-hoc handling for zod error
    if (objectHas(err.cause, "name") && err.cause.name === "ZodError") {
      err.httpStatus = 400;
    }
    return err;
  }
}

// TODO: to utils
function objectHas<Prop extends keyof any>(
  v: unknown,
  prop: Prop
): v is { [prop in Prop]: unknown } {
  return Boolean(v && typeof v === "object" && prop in v);
}
