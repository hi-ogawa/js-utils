import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestContext, RequestHandler } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext() {
  const value = requestContextStorage.getStore();
  tinyassert(value, `forgot 'requestContextStorage'?`);
  return value;
}

export function requestContextStorageHandler(): RequestHandler {
  return async (ctx) => requestContextStorage.run(ctx, () => ctx.next());
}
