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

//
// example rpc
//

function defineExampleRpc() {
  let counter = 0;

  return {
    checkId: (id: string) => id === "good",

    getCounter: () => counter,

    incrementCounter: zodFn(z.object({ delta: z.number().default(1) }))(
      (input) => {
        counter += input.delta;
        return counter;
      }
    ),
  } satisfies TinyRpcRoutes;
}

// define function with arguments validated by zod
function zodFn<Schema extends z.ZodType>(schema: Schema) {
  return function decorate<Out>(
    fn: (input: z.output<Schema>) => Out
  ): (input: z.input<Schema>) => Out {
    return function wrapper(input) {
      return fn(schema.parse(input));
    };
  };
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
