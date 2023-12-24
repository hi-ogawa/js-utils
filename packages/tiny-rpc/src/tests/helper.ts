import { AsyncLocalStorage } from "node:async_hooks";
import { type RequestHandler } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";
import { expectTypeOf } from "vitest";
import { z } from "zod";
import { validateFn } from "../validation";

export function defineTestRpcRoutes() {
  //
  // service internal
  //
  let counter = 0;

  //
  // context
  // (implicit input e.g. request session etc...)
  // (it can be scoped by request using AsyncLocalStorage and middleware)
  //
  interface RpcContext {
    request: Request;
  }

  const contextStorage = new AsyncLocalStorage<RpcContext>();

  function useContext() {
    const ctx = contextStorage.getStore();
    tinyassert(ctx);
    return ctx;
  }

  function contextProviderHandler(): RequestHandler {
    // middleware to initialize context scoped by request
    return async (ctx) => {
      return contextStorage.run({ request: ctx.request }, () => ctx.next());
    };
  }

  //
  // service api
  //
  const routes = {
    // define as a bare function
    checkId: (id: string) => id === "good",

    checkIdThrow: (id: string) => {
      tinyassert(id === "good", "Invalid ID");
      return null;
    },

    getCounter: () => counter,

    // define with zod validation + input type inference
    incrementCounter: validateFn(z.object({ delta: z.number().default(1) }))(
      (input) => {
        expectTypeOf(input).toEqualTypeOf<{ delta: number }>();
        counter += input.delta;
        return counter;
      }
    ),

    // access context
    checkAuth: () => {
      const { request } = useContext();
      return request.headers.get("x-auth") === "good";
    },
  };

  return { routes, contextProviderHandler };
}
