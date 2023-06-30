import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import {
  type TinyRpcRoutes,
  createTinyRpcClientProxy,
  createTinyRpcHandler,
} from ".";

//
// example rpc
//

function defineExampleRpc() {
  let counter = 0;

  return {
    checkId: (id: string) => id === "good",

    getCounter: () => counter,

    updateCounter: (delta: number) => {
      counter += delta;
      return counter;
    },
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
    expect(await client.updateCounter(1)).toMatchInlineSnapshot("1");
    expect(await client.getCounter()).toMatchInlineSnapshot("1");

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
