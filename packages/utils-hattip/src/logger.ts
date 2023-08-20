// porting hono's logger to hattip
// https://github.com/honojs/hono/blob/a8ebb47dddf2297341ced144b7e7e32b79a4f850/src/middleware/logger/index.ts

// don't have to require hard dependency to hattip typing
type LoggerHandler = (ctx: {
  request: Request;
  next: () => Promise<Response>;
}) => Promise<Response>;

export function createLoggerHandler(options?: {
  log?: (v: string) => void;
}): LoggerHandler {
  const log = options?.log ?? console.log;
  return async (ctx) => {
    const method = ctx.request.method;
    const pathname = new URL(ctx.request.url).pathname;
    log(`  --> ${method} ${pathname}`);

    const startTime = Date.now();
    const response = await ctx.next();
    const duration = formatDuration(Date.now() - startTime);
    log(`  <-- ${method} ${pathname} ${response.status} ${duration}`);

    return response;
  };
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.floor(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}
