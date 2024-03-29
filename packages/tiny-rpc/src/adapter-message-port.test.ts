import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it } from "vitest";
import {
  type TinyRpcMessagePort,
  messagePortClientAdapter,
  messagePortServerAdapter,
  messagePortWrapTransfer,
} from "./adapter-message-port";
import { TinyRpcError, exposeTinyRpc, proxyTinyRpc } from "./core";
import type { TinyRpcMessagePortNode } from "./message-port/nodejs";
import { defineTestRpcRoutes } from "./tests/helper";

describe("adapter-message-port", () => {
  it("basic", async () => {
    const { routes } = defineTestRpcRoutes();

    //
    // server
    //

    const channel = new MessageChannel();
    const dispose = exposeTinyRpc({
      routes,
      adapter: messagePortServerAdapter({ port: channel.port1 }),
    });
    expect(dispose).toMatchInlineSnapshot("[Function]");

    //
    // client
    //
    const client = proxyTinyRpc<typeof routes>({
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
      tinyassert(e instanceof TinyRpcError);
      expect(e).toMatchInlineSnapshot(`
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
      // TODO: support custom Error class in cause
      expect(e.cause).toBeInstanceOf(Error);
      expect(e.cause).not.toBeInstanceOf(TinyRpcError);
      expect(e.cause).toMatchInlineSnapshot("[Error]");
      return true;
    });

    // invalid path
    await expect((client as any).incrementCounterXXX()).rejects.toSatisfy(
      (e) => {
        tinyassert(e instanceof TinyRpcError);
        expect(e).toMatchInlineSnapshot("[Error: invalid path]");
        expect(e.cause).toMatchInlineSnapshot('"incrementCounterXXX"');
        return true;
      }
    );

    // runtime erorr
    await expect(client.checkIdThrow("bad")).rejects.toSatisfy((e) => {
      tinyassert(e instanceof TinyRpcError);
      expect(e).toMatchInlineSnapshot("[Error: Invalid ID]");
      return true;
    });
  });

  it("transferable", async () => {
    const channel = new MessageChannel();

    //
    // server
    //
    const routes = {
      testRequest: (data: Uint8Array) => {
        return data[0];
      },
      testResponse: (enable: boolean) => {
        const data = new Uint8Array([100]);
        if (enable) {
          return messagePortWrapTransfer(data, [data.buffer]);
        }
        return data;
      },
    };
    exposeTinyRpc({
      routes,
      adapter: messagePortServerAdapter({ port: channel.port1 }),
    });

    //
    // client
    //
    const client = proxyTinyRpc<typeof routes>({
      adapter: messagePortClientAdapter({ port: channel.port2 }),
    });

    // send ArrayBuffer
    {
      const data = new Uint8Array([100]);
      expect(data.byteLength).toMatchInlineSnapshot(`1`);
      expect(
        await client.testRequest(messagePortWrapTransfer(data, [data.buffer]))
      ).toMatchInlineSnapshot(`100`);
      expect(data.byteLength).toMatchInlineSnapshot(`0`);
    }

    // can send without transfer
    {
      const data = new Uint8Array([100]);
      expect(data.byteLength).toMatchInlineSnapshot(`1`);
      expect(await client.testRequest(data)).toMatchInlineSnapshot(`100`);
      expect(data.byteLength).toMatchInlineSnapshot(`1`);
    }

    // response
    expect(await client.testResponse(true)).toMatchInlineSnapshot(`
      Uint8Array [
        100,
      ]
    `);
    expect(await client.testResponse(false)).toMatchInlineSnapshot(`
      Uint8Array [
        100,
      ]
    `);
  });

  it("bi-direction with a single pair of ports", async () => {
    const channel = new MessageChannel();

    // example from https://github.com/antfu/birpc
    const alice = {
      hi: (name: string) => `Hi ${name}, I am Alice`,
    };
    const bob = {
      hey: (name: string) => `Hey ${name}, I am Bob`,
    };

    // alice uses bobProxy
    exposeTinyRpc({
      routes: alice,
      adapter: messagePortServerAdapter({ port: channel.port1 }),
    });
    const bobProxy = proxyTinyRpc<typeof bob>({
      adapter: messagePortClientAdapter({ port: channel.port1 }),
    });

    // bob uses alisProxy
    exposeTinyRpc({
      routes: bob,
      adapter: messagePortServerAdapter({ port: channel.port2 }),
    });
    const aliceProxy = proxyTinyRpc<typeof alice>({
      adapter: messagePortClientAdapter({ port: channel.port2 }),
    });

    expect(await bobProxy.hey("alice")).toMatchInlineSnapshot(
      `"Hey alice, I am Bob"`
    );
    expect(await aliceProxy.hi("bob")).toMatchInlineSnapshot(
      `"Hi bob, I am Alice"`
    );
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
