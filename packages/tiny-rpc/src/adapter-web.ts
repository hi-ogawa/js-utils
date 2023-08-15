import { tinyassert } from "@hiogawa/utils";
import type { TinyRpcClientAdapter, TinyRpcServerAdapter } from "./core";

// compatible with hattip's RequestHandler
type RequestHandler = (ctx: {
  request: Request;
}) => Promise<Response | undefined>;

export function hattipServerAdapter(opts: {
  endpoint: string;
}): TinyRpcServerAdapter<RequestHandler> {
  return {
    on: (invokeRoute): RequestHandler => {
      return async ({ request }) => {
        const url = new URL(request.url);
        if (!url.pathname.startsWith(opts.endpoint)) {
          return;
        }
        tinyassert(request.method === "POST");
        const path = url.pathname.slice(opts.endpoint.length + 1);
        const args = await request.json();
        const result = await invokeRoute({ path, args });
        return new Response(JSON.stringify(result), {
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
      };
    },
  };
}

export function httpClientAdapter(opts: {
  url: string;
  fetch?: typeof fetch;
}): TinyRpcClientAdapter {
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
      tinyassert(res.ok);
      return res.json();
    },
  };
}
