import { AsyncLocalStorage } from "node:async_hooks";
import { createServer } from "@hattip/adapter-node";
import { type RequestHandler, compose } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { fetchClientAdapter, hattipServerAdapter } from "./adapter-web";
import { type RpcRoutes, exposeRpc, proxyRpc } from "./core";
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
    incrementCounter: zodFn(z.object({ delta: z.number().default(1) }))(
      (input) => {
        input satisfies { delta: number };
        counter += input.delta;
        return counter;
      }
    ),

    // access context
    checkAuth: () => {
      const { request } = useContext();
      return request.headers.get("x-auth") === "good";
    },
  } satisfies RpcRoutes;

  return { routes, contextProviderHandler };
}

//
// test
//

describe("e2e", () => {
  it("basic", async () => {
    // define example rpc
    const endpoint = "/rpc";
    const { routes, contextProviderHandler } = defineExampleRpc();

    //
    // server
    //
    const server = createServer(
      compose(
        (ctx) => {
          ctx.handleError = () => {
            return new Response(null, { status: 500 });
          };
        },
        contextProviderHandler(),
        exposeRpc({
          routes,
          adapter: hattipServerAdapter({ endpoint }),
        }),
        () => new Response("tiny-rpc-skipped")
      )
    );
    const { url } = await startTestServer(server);

    //
    // client
    //
    const headers: Record<string, string> = {}; // inject headers to demonstrate context
    const client = proxyRpc<typeof routes>({
      adapter: fetchClientAdapter({
        url: url + endpoint,
        fetch: (url, input) =>
          fetch(url, {
            ...input,
            headers: {
              ...input?.headers,
              ...headers,
            },
          }),
      }),
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

    // context
    headers["x-auth"] = "good";
    expect(await client.checkAuth()).toMatchInlineSnapshot("true");
    headers["x-auth"] = "bad";
    expect(await client.checkAuth()).toMatchInlineSnapshot("false");

    //
    // error
    //

    // input validation
    await expect(
      client.incrementCounter({ delta: "2" as any })
    ).rejects.toSatisfy((e) => {
      expect(e).toMatchInlineSnapshot("[Error]");
      // tinyassert(e instanceof TinyRpcError);
      // expect(e.status).toMatchInlineSnapshot("500");
      // expect(e.cause).toMatchInlineSnapshot(`
      //   {
      //     "issues": [
      //       {
      //         "code": "invalid_type",
      //         "expected": "number",
      //         "message": "Expected number, received string",
      //         "path": [
      //           "delta",
      //         ],
      //         "received": "string",
      //       },
      //     ],
      //     "name": "ZodError",
      //   }
      // `);
      // expect(e).toMatchInlineSnapshot(`
      //   [Error: [
      //     {
      //       "code": "invalid_type",
      //       "expected": "number",
      //       "received": "string",
      //       "path": [
      //         "delta"
      //       ],
      //       "message": "Expected number, received string"
      //     }
      //   ]]
      // `);
      return true;
    });

    // invalid path
    await expect((client as any).incrementCounterXXX()).rejects.toSatisfy(
      (e) => {
        expect(e).toMatchInlineSnapshot("[Error]");
        // tinyassert(e instanceof TinyRpcError);
        // expect(e.status).toMatchInlineSnapshot("404");
        // expect(e).toMatchInlineSnapshot("[Error: NOT_FOUND]");
        return true;
      }
    );

    // runtime erorr
    await expect(client.checkIdThrow("bad")).rejects.toSatisfy((e) => {
      expect(e).toMatchInlineSnapshot("[Error]");
      // tinyassert(e instanceof TinyRpcError);
      // expect(e.status).toMatchInlineSnapshot("500");
      // expect(e).toMatchInlineSnapshot("[Error: Invalid ID]");
      return true;
    });

    // ignore non-endpoint
    expect(
      await fetch(url + "/non-endpoint").then((res) => res.text())
    ).toMatchInlineSnapshot('"tiny-rpc-skipped"');

    server.close();
  });
});

async function startTestServer(server: ReturnType<typeof createServer>) {
  await new Promise<void>((resolve) => server.listen(() => resolve()));

  // get address
  const address = server.address();
  tinyassert(address);
  tinyassert(typeof address !== "string");
  const url = `http://localhost:${address.port}`;

  return { server, url };
}
