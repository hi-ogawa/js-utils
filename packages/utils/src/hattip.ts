// sneak in hattip in utils
// TODO: move to `@hiogawa/utils-hattip` if there will be more

// porting hono's logger to hattip
// https://github.com/honojs/hono/blob/a8ebb47dddf2297341ced144b7e7e32b79a4f850/src/middleware/logger/index.ts

// compatible with hattip's RequestHandler
type HttpLogger = (ctx: {
  request: Request;
  next: () => Promise<Response>;
}) => Promise<Response>;

type LogEntry =
  | { type: "request"; request: Request }
  | {
      type: "response";
      request: Request;
      response: Response;
      duration: number;
    };

export function createHttpLogger(options?: {
  printer?: (e: LogEntry) => void;
}): HttpLogger {
  const printer = options?.printer ?? defaultHttipLoggerPrinter();

  return async (ctx) => {
    const request = ctx.request;
    printer({ type: "request", request });
    const startTime = Date.now();
    const response = await ctx.next();
    const duration = Date.now() - startTime;
    printer({ type: "response", request, response, duration });
    return response;
  };
}

function defaultHttipLoggerPrinter(options?: { log?: (v: string) => void }) {
  const log = options?.log ?? console.log;
  return (e: LogEntry) => {
    const method = e.request.method;
    const pathname = new URL(e.request.url).pathname;
    if (e.type === "request") {
      log(`  --> ${method} ${pathname}`);
    }
    if (e.type === "response") {
      const duration = formatDuration(e.duration);
      log(`  <-- ${method} ${pathname} ${e.response.status} ${duration}`);
    }
  };
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.floor(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}
