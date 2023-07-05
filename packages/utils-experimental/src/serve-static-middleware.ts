import fs from "node:fs";
import { Readable } from "node:stream";

// it should be needed only for dev,
// but then usually in that case, vite dev server already handles assets in `publicDir`.

// cf.
// https://github.com/expressjs/serve-static/blob/9b5a12a76f4d70530d2d2a8c7742e9158ed3c0a4/index.js
// https://github.com/lukeed/sirv/blob/19c6895483cc71e9ef367f8a6a863af1e558ecb0/packages/sirv/index.js
// https://github.com/honojs/node-server/blob/0a505a17112716987bc57b4be8df73df7dc6783a/src/serve-static.ts

// compatible with hattip's RequestHandler
export type ServerStaticMiddleware = (ctx: {
  request: Pick<Request, "method" | "url">;
  next: () => Promise<Response>;
}) => Promise<Response | undefined>;

export function serveStaticMiddleware(options?: {
  root?: string;
  contentTypes: Record<string, string>;
}): ServerStaticMiddleware {
  const root = options?.root ?? "public";

  // TODO: maybe copy mrmime? https://github.com/lukeed/mrmime/blob/master/deno/mod.ts
  const contentTypes: Record<string, string> = {
    js: "application/javascript",
    json: "application/json",
    ...options?.contentTypes,
  };

  return async ({ request }) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return;
    }
    const url = new URL(request.url);
    const filePath = root + url.pathname;
    const stream = await readFileStream(filePath);
    if (stream) {
      const res = new Response(stream);
      const contentType = contentTypes[filePath.split(".").at(-1)!];
      if (contentType) {
        res.headers.set("content-type", contentType);
      }
      return res;
    }
    return;
  };
}

async function readFileStream(
  filePath: string
): Promise<ReadableStream | undefined> {
  let dispose: (() => Promise<void>) | undefined;
  try {
    // open and set dispose callback
    const handle = await fs.promises.open(filePath, "r");
    dispose = () => handle.close();

    // skip directory
    const stat = await handle.stat();
    if (stat.isDirectory()) {
      return;
    }

    // convert to ReadableStream
    const nodeReadStream = handle.createReadStream({
      autoClose: true,
    });
    const webReadableStream = Readable.toWeb(nodeReadStream);
    dispose = undefined; // autoClose
    return webReadableStream as ReadableStream; // workaround confused ambient typing
  } catch (e) {
    if (!(e instanceof Error && "code" in e && e.code === "ENOENT")) {
      throw e;
    }
  } finally {
    await dispose?.();
  }
  return;
}
