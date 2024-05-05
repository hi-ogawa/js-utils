import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { createManualPromise, tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import * as ws from "ws";
import {
  messagePortClientAdapter,
  messagePortServerAdapter,
} from "../adapter-message-port";
import { TinyRpcError, exposeTinyRpc, proxyTinyRpc } from "../core";
import { defineTestRpcRoutes, startTestServer } from "../tests/helper";
import { WebSocketMessagePort } from "./websocket";

describe("websocket", () => {
  it("basic", async () => {
    const endpoint = "/ws";

    //
    // server
    //
    const server = createServer(compose());
    const clientProxyPromise = createManualPromise<ws.WebSocket>();
    const wsServer = new ws.WebSocketServer({ server, path: endpoint });
    wsServer.on("connection", (client) => {
      clientProxyPromise.resolve(client);
    });
    const { url } = await startTestServer(server);

    //
    // client
    //
    //
    const client = new ws.WebSocket(url.replace(/^http/, "ws") + endpoint);
    const clientProxy = await clientProxyPromise;

    //
    // server -> client
    //
    let resultPromise = createManualPromise<unknown>();
    client.addEventListener("message", (e) => {
      resultPromise.resolve(e.data);
    });
    clientProxy.send("hello");
    expect(await resultPromise).toMatchInlineSnapshot(`"hello"`);

    resultPromise = createManualPromise<unknown>();
    clientProxy.send("world");
    expect(await resultPromise).toMatchInlineSnapshot(`"world"`);

    //
    // client -> server
    //
    resultPromise = createManualPromise<unknown>();
    clientProxy.addEventListener("message", (e) => {
      resultPromise.resolve(e.data);
    });
    client.send("foo");
    expect(await resultPromise).toMatchInlineSnapshot(`"foo"`);

    resultPromise = createManualPromise<unknown>();
    client.send("bar");
    expect(await resultPromise).toMatchInlineSnapshot(`"bar"`);
  });

  it("rpc", async () => {
    const endpoint = "/ws";

    //
    // server
    //
    const server = createServer(compose());
    const clientProxyPromise = createManualPromise<ws.WebSocket>();
    const wsServer = new ws.WebSocketServer({ server, path: endpoint });
    wsServer.on("connection", (client) => {
      clientProxyPromise.resolve(client);
    });
    const { url } = await startTestServer(server);

    //
    // client
    //
    //
    const client = new ws.WebSocket(url.replace(/^http/, "ws") + endpoint);
    const clientProxy = await clientProxyPromise;

    //
    // rpc server on client
    //
    const { routes } = defineTestRpcRoutes();
    exposeTinyRpc({
      routes,
      adapter: messagePortServerAdapter({
        port: new WebSocketMessagePort(client as any),
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      }),
    });

    //
    // rpc client on server
    //
    const rpcProxy = proxyTinyRpc<typeof routes>({
      adapter: messagePortClientAdapter({
        port: new WebSocketMessagePort(clientProxy as any),
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      }),
    });

    //
    // test rpc
    //
    expect(await rpcProxy.checkId("good")).toMatchInlineSnapshot("true");
    expect(await rpcProxy.checkId("bad")).toMatchInlineSnapshot("false");
    expect(await rpcProxy.getCounter()).toMatchInlineSnapshot("0");
    expect(await rpcProxy.incrementCounter({})).toMatchInlineSnapshot("1");
    expect(await rpcProxy.getCounter()).toMatchInlineSnapshot("1");
    expect(await rpcProxy.incrementCounter({ delta: 2 })).toMatchInlineSnapshot(
      `3`
    );
    expect(await rpcProxy.getCounter()).toMatchInlineSnapshot("3");

    {
      const error = await getError(() =>
        rpcProxy.incrementCounter({ delta: "2" as any })
      );
      tinyassert(error instanceof TinyRpcError);
      expect(error).toMatchInlineSnapshot(`
        [Error: [
          {
            "code": "invalid_type",
            "expected": "number",
            "received": "string",
            "path": [
              "delta"
            ],
            "message": "Expected number, received string"
          }
        ]]
      `);
    }
  });
});

async function getError(f: () => Promise<unknown>) {
  try {
    await f();
  } catch (e) {
    return e;
  }
  expect.unreachable();
}
