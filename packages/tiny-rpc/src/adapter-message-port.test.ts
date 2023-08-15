import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  type TinyRpcMessagePort,
  messagePortClientAdapter,
  messagePortServerAdapter,
} from "./adapter-message-port";
import type { TinyRpcMessagePortNode } from "./adapter-message-port-node";
import { type RpcRoutes, exposeRpc, proxyRpc } from "./core";
import { zodFn } from "./zod";

//
// example rpc
//

function defineExampleRpc() {
  let counter = 0;

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
  } satisfies RpcRoutes;

  return { routes };
}

//
// test
//

describe("adapter-message-port", () => {
  it("basic", async () => {
    const { routes } = defineExampleRpc();

    //
    // server
    //

    const channel = new MessageChannel();
    const dispose = exposeRpc({
      routes,
      adapter: messagePortServerAdapter({ port: channel.port1 }),
    });
    expect(dispose).toMatchInlineSnapshot("[Function]");

    //
    // client
    //
    const client = proxyRpc<typeof routes>({
      adapter: messagePortClientAdapter({ port: channel.port2 }),
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

    //
    // error
    //

    // input validation
    await expect(
      client.incrementCounter({ delta: "2" as any as number })
    ).rejects.toSatisfy((e) => {
      // ZodError is not propagated through MessageChannel
      // but `Error.stack` is kept as is
      tinyassert(e instanceof Error);
      expect(e).toMatchInlineSnapshot("[Error]");
      expect(e.stack?.match(/.*^]/ms)?.[0]).toMatchInlineSnapshot(`
        "ZodError: [
          {
            \\"code\\": \\"invalid_type\\",
            \\"expected\\": \\"number\\",
            \\"received\\": \\"string\\",
            \\"path\\": [
              \\"delta\\"
            ],
            \\"message\\": \\"Expected number, received string\\"
          }
        ]"
      `);
      return true;
    });

    // invalid path
    await expect((client as any).incrementCounterXXX()).rejects.toSatisfy(
      (e) => {
        expect(e).toMatchInlineSnapshot(
          "[Error: invalid path 'incrementCounterXXX']"
        );
        return true;
      }
    );

    // runtime erorr
    await expect(client.checkIdThrow("bad")).rejects.toSatisfy((e) => {
      expect(e).toMatchInlineSnapshot("[Error: Invalid ID]");
      return true;
    });
  });

  it("web worker", () => {
    // check typing
    () => {
      new Worker("") satisfies TinyRpcMessagePort;
      self satisfies TinyRpcMessagePort;
    };
  });

  it("node worker", () => {
    // check typing
    async () => {
      const { Worker, MessagePort } = await import("node:worker_threads");
      new Worker("") satisfies TinyRpcMessagePortNode;
      new MessagePort() satisfies TinyRpcMessagePortNode;
    };
  });
});
