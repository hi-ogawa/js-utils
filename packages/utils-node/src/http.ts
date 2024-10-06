import type http from "node:http";
import { Readable } from "node:stream";

// https://github.com/hattipjs/hattip/blob/69237d181300b200a14114df2c3c115c44e0f3eb/packages/adapter/adapter-node/src/common.ts
// https://github.com/remix-run/remix/blob/6eb6acf3f065f4574fbc96e4e8879482ce77b560/packages/remix-express/server.ts
// https://github.com/honojs/node-server/blob/becc420b5d4ea51977a8e5b12e945ceb09c2ee9a/src/listener.ts
// https://github.com/Shopify/hydrogen/blob/adc840f584129968d1710d494d19165e6664a60d/packages/mini-oxygen/src/vite/utils.ts

export type WebHandler = (
  request: Request
) => Response | undefined | Promise<Response | undefined>;

export type NodeHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next?: (error?: unknown) => void
) => void;

export function webToNodeHandler(handler: WebHandler): NodeHandler {
  return async (req, res, next = createDefaultNext(res)) => {
    try {
      const request = createRequest(req, res);
      const response = await handler(request);
      if (response) {
        sendResponse(response, res);
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  };
}

function createDefaultNext(res: http.ServerResponse) {
  return (e?: unknown) => {
    if (e) {
      console.error(e);
      res.statusCode = 500;
      res.end("Internal server error");
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  };
}

function createRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Request {
  // cf. hono
  const abortController = new AbortController();
  res.once("close", () => {
    if (req.destroyed) {
      abortController.abort();
    }
  });

  // cf. hattip, remix
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    // skip http2 pseudo header since it breaks undici
    if (k.startsWith(":")) {
      continue;
    }
    if (typeof v === "string") {
      headers.set(k, v);
    } else if (Array.isArray(v)) {
      v.forEach((v) => headers.append(k, v));
    }
  }

  return new Request(
    new URL(
      req.url || "/",
      `${headers.get("x-forwarded-proto") ?? "http"}://${
        req.headers.host || "unknown.local"
      }`
    ),
    {
      method: req.method,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? null
          : (Readable.toWeb(req) as any),
      headers,
      signal: abortController.signal,
      // @ts-ignore required for undici ReadableStream body
      duplex: "half",
    }
  );
}

function sendResponse(response: Response, res: http.ServerResponse) {
  // cf. hydrogen
  const headers = Object.fromEntries(response.headers);
  if (headers["set-cookie"]) {
    delete headers["set-cookie"];
    res.setHeader("set-cookie", response.headers.getSetCookie());
  }
  res.writeHead(response.status, response.statusText, headers);

  if (response.body) {
    const abortController = new AbortController();
    res.once("close", () => abortController.abort());
    res.once("error", () => abortController.abort());
    Readable.fromWeb(response.body as any, {
      signal: abortController.signal,
    }).pipe(res);
  } else {
    res.end();
  }
}
