// porting hono's logger to hattip
// https://github.com/honojs/hono/blob/a8ebb47dddf2297341ced144b7e7e32b79a4f850/src/middleware/logger/index.ts

// compatible with hattip's RequestHandler
export type LoggerMiddleware = (ctx: {
  request: Pick<Request, "method" | "url">;
  next: () => Promise<Response>;
}) => Promise<Response>;

export function loggerMiddleware(options?: {
  log?: (v: string) => void;
}): LoggerMiddleware {
  const log = options?.log ?? console.log;

  return async (ctx) => {
    const url = new URL(ctx.request.url, "https://dummy.local");
    const pathname = url.pathname;
    const method = ctx.request.method;

    const startTime = Date.now();
    log(`  --> ${method} ${pathname}`);

    const res = await ctx.next();

    const duration = formatDuration(Date.now() - startTime);
    log(`  <-- ${method} ${pathname} ${res.status} ${duration}`);

    return res;
  };
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.floor(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}
