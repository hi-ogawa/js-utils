import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { httpClientAdapter, httpServerAdapter } from "./adapter-web";
import { TinyRpcError, exposeTinyRpc, proxyTinyRpc } from "./core";
import { defineTestRpcRoutes } from "./tests/helper";

//
// test
//

describe("e2e", () => {
  it("basic", async () => {
    const endpoint = "/rpc";
    const { routes, contextProviderHandler } = defineTestRpcRoutes();

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
        exposeTinyRpc({
          routes,
          adapter: httpServerAdapter({ endpoint, method: "POST" }),
        }),
        () => new Response("tiny-rpc-skipped")
      )
    );
    const { url } = await startTestServer(server);

    //
    // client
    //
    const headers: Record<string, string> = {}; // inject headers to demonstrate context
    const logStatus = vi.fn();
    const client = proxyTinyRpc<typeof routes>({
      adapter: httpClientAdapter({
        url: url + endpoint,
        method: "POST",
        fetch: async (url, input) => {
          const res = await fetch(url, {
            ...input,
            headers: {
              ...input?.headers,
              ...headers,
            },
          });
          logStatus(res.status);
          return res;
        },
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
    expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("200");

    //
    // error
    //

    // input validation
    await expect(
      client.incrementCounter({ delta: "2" as any as number })
    ).rejects.toSatisfy((e) => {
      expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("400");
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
      return true;
    });

    // invalid path
    await expect((client as any).incrementCounterXXX()).rejects.toSatisfy(
      (e) => {
        expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("500");
        tinyassert(e instanceof TinyRpcError);
        expect(e).toMatchInlineSnapshot("[Error: invalid path]");
        return true;
      }
    );

    // runtime erorr
    await expect(client.checkIdThrow("bad")).rejects.toSatisfy((e) => {
      expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("500");
      tinyassert(e instanceof TinyRpcError);
      expect(e).toMatchInlineSnapshot("[Error: Invalid ID]");
      return true;
    });

    // ignore non-endpoint
    expect(
      await fetch(url + "/non-endpoint").then((res) => res.text())
    ).toMatchInlineSnapshot('"tiny-rpc-skipped"');

    // invalid method
    expect(
      await fetch(url + endpoint).then((res) => res.status)
    ).toMatchInlineSnapshot("405");

    server.close();
  });

  // test is copy-pasted for GET
  it("GET", async () => {
    const endpoint = "/rpc";
    const { routes, contextProviderHandler } = defineTestRpcRoutes();

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
        exposeTinyRpc({
          routes,
          adapter: httpServerAdapter({ endpoint, method: "GET" }),
        }),
        () => new Response("tiny-rpc-skipped")
      )
    );
    const { url } = await startTestServer(server);

    //
    // client
    //
    const headers: Record<string, string> = {}; // inject headers to demonstrate context
    const logStatus = vi.fn();
    const client = proxyTinyRpc<typeof routes>({
      adapter: httpClientAdapter({
        url: url + endpoint,
        method: "GET",
        fetch: async (url, input) => {
          const res = await fetch(url, {
            ...input,
            headers: {
              ...input?.headers,
              ...headers,
            },
          });
          logStatus(res.status);
          return res;
        },
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
    expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("200");

    //
    // error
    //

    // input validation
    await expect(
      client.incrementCounter({ delta: "2" as any as number })
    ).rejects.toSatisfy((e) => {
      expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("400");
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
      return true;
    });

    // invalid path
    await expect((client as any).incrementCounterXXX()).rejects.toSatisfy(
      (e) => {
        expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("500");
        tinyassert(e instanceof TinyRpcError);
        expect(e).toMatchInlineSnapshot("[Error: invalid path]");
        return true;
      }
    );

    // runtime erorr
    await expect(client.checkIdThrow("bad")).rejects.toSatisfy((e) => {
      expect(logStatus.mock.lastCall[0]).toMatchInlineSnapshot("500");
      tinyassert(e instanceof TinyRpcError);
      expect(e).toMatchInlineSnapshot("[Error: Invalid ID]");
      return true;
    });

    // ignore non-endpoint
    expect(
      await fetch(url + "/non-endpoint").then((res) => res.text())
    ).toMatchInlineSnapshot('"tiny-rpc-skipped"');

    // invalid method
    expect(
      await fetch(url + endpoint, { method: "POST" }).then((res) => res.status)
    ).toMatchInlineSnapshot("405");

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
