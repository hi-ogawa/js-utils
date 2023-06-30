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

// TODO: async context example

function defineExampleRpc() {
  let counter = 0;

  return {
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
  } satisfies TinyRpcRoutes;
}

//
// test
//

describe("e2e", () => {
  it("basic", async () => {
    // define example rpc
    const endpoint = "/rpc";
    const routes = defineExampleRpc();

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
    expect(await client.incrementCounter({})).toMatchInlineSnapshot("1");
    expect(await client.getCounter()).toMatchInlineSnapshot("1");
    expect(await client.incrementCounter({ delta: 2 })).toMatchInlineSnapshot(
      "3"
    );
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
