import { type Result, tinyassert, wrapErrorAsync } from "@hiogawa/utils";
import { type RpcClientAdapter, RpcError, type RpcServerAdapter } from "./core";

// TODO:
// - map error to http error code
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
        tinyassert(request.method === "POST"); // TODO: error
        const path = url.pathname.slice(opts.endpoint.length + 1);
        const args = await request.json();
        const result = await wrapErrorAsync(async () =>
          invokeRoute({ path, args })
        );
        if (!result.ok) {
          opts.onError?.(result.value);
          result.value = RpcError.fromUnknown(result.value).serialize();
        }
        return new Response(JSON.stringify(result), {
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
      tinyassert(res.ok); // TODO: error

      const result: Result<unknown, unknown> = await res.json();
      if (!result.ok) {
        throw RpcError.fromUnknown(result.value);
      }
      return result.value;
    },
  };
}
