import { AsyncLocalStorage } from "node:async_hooks";
import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  type TinyRpcRoutes,
  createTinyRpcClientProxy,
  createTinyRpcHandler,
} from ".";
import { zodFn } from "./zod";

//
// example rpc
//

function defineExampleRpc() {
  //
  // service internal
  //
  let counter = 0;

  //
  // context
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

  //
  // service api
  //
  const routes = {
    // define as a bare function
    checkId: (id: string) => id === "good",

    getCounter: () => counter,

    // define with zod validation + input type inference
    incrementCounter: zodFn(z.object({ delta: z.number().default(1) }))(
      (input) => {
        input satisfies { delta: number };
        counter += input.delta;
        return counter;
      }
    ),

    // access context (implicit input e.g. request session etc...)
    checkAuth: () => {
      const { request } = useContext();
      return request.headers.get("x-auth") === "good";
    },
  } satisfies TinyRpcRoutes;

  return { routes, contextStorage };
}

//
// test
//

describe("e2e", () => {
  it("basic", async () => {
    // define example rpc
    const endpoint = "/rpc";
    const { routes, contextStorage } = defineExampleRpc();
    contextStorage;

    // server
    const handler = createTinyRpcHandler({ endpoint, routes });
    const { server, url } = await startTestServer(handler);

    // client
    const client = createTinyRpcClientProxy<typeof routes>({
      endpoint: url + endpoint,
    });
    expect(await client.checkId("good")).toMatchInlineSnapshot("true");
    expect(await client.checkId("bad")).toMatchInlineSnapshot("false");

    expect(await client.getCounter()).toMatchInlineSnapshot("0");

    // default value by zod
    expect(await client.incrementCounter({})).toMatchInlineSnapshot("1");
    expect(await client.getCounter()).toMatchInlineSnapshot("1");

    expect(await client.incrementCounter({ delta: 2 })).toMatchInlineSnapshot(
      "3"
    );
    expect(await client.getCounter()).toMatchInlineSnapshot("3");

    // zod validation
    await expect(
      client.incrementCounter({ delta: "2" as any })
    ).rejects.toMatchInlineSnapshot("[Error]");
    expect(await client.getCounter()).toMatchInlineSnapshot("3");

    server.close();
  });
});

async function startTestServer(
  handler: ReturnType<typeof createTinyRpcHandler>
) {
  // start server
  const server = createServer(compose(handler));
  await new Promise<void>((resolve) => server.listen(() => resolve()));

  // get address
  const address = server.address();
  tinyassert(address);
  tinyassert(typeof address !== "string");
  const url = `http://localhost:${address.port}`;

  return { server, url };
}
