import { type Result, tinyassert, wrapErrorAsync } from "@hiogawa/utils";
import {
  type TinyRpcClientAdapter,
  TinyRpcError,
  type TinyRpcServerAdapter,
} from "./core";

// compatible with hattip's RequestHandler
type RequestHandler = (ctx: {
  request: Request;
}) => Promise<Response | undefined>;

export function httpServerAdapter(opts: {
  endpoint: string;
  method?: "GET" | "POST";
  onError?: (e: unknown) => void;
}): TinyRpcServerAdapter<RequestHandler> {
  return {
    register: (invokeRoute): RequestHandler => {
      return async ({ request }) => {
        const url = new URL(request.url);
        if (!url.pathname.startsWith(opts.endpoint)) {
          return;
        }
        const result = await wrapErrorAsync(async () => {
          tinyassert(
            request.method === (opts.method ?? "POST"),
            new TinyRpcError("invalid method", {
              cause: request.method,
            }).setStatus(405)
          );
          const path = url.pathname.slice(opts.endpoint.length + 1);
          let args: unknown[];
          if (opts.method === "GET") {
            const payload = url.searchParams.get(GET_PAYLOAD_PARAM);
            tinyassert(typeof payload === "string");
            args = JSON.parse(payload);
          } else {
            args = await request.json();
          }
          return invokeRoute({ path, args });
        });
        let status = 200;
        if (!result.ok) {
          opts.onError?.(result.value);
          const e = TinyRpcError.fromUnknown(result.value);
          status = e.status;
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

export function httpClientAdapter(opts: {
  url: string;
  method?: "GET" | "POST";
  fetch?: (typeof globalThis)["fetch"];
}): TinyRpcClientAdapter {
  const fetch = opts.fetch ?? globalThis.fetch;
  return {
    send: async (data) => {
      const url = [opts.url, data.path].join("/");
      const payload = JSON.stringify(data.args);
      let req: Request;
      if (opts.method === "GET") {
        req = new Request(
          url + "?" + new URLSearchParams({ [GET_PAYLOAD_PARAM]: payload })
        );
      } else {
        req = new Request(url, {
          method: "POST",
          body: payload,
          headers: {
            "content-type": "application/json; charset=utf-8",
          },
        });
      }
      const res = await fetch(req);
      const result: Result<unknown, unknown> = await res.json();
      if (!result.ok) {
        throw result.value;
      }
      return result.value;
    },
  };
}

const GET_PAYLOAD_PARAM = "payload";
