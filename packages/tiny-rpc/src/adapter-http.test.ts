import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { httpClientAdapter, httpServerAdapter } from "./adapter-http";
import { TinyRpcError, exposeTinyRpc, proxyTinyRpc } from "./core";
import { defineTestRpcRoutes, startTestServer } from "./tests/helper";
import { validateFn } from "./validation";

describe("adapter-http", () => {
  it("basic", async () => {
    const { routes, contextProviderHandler } = defineTestRpcRoutes();

    //
    // server
    //
    const endpoint = "/rpc";
    const pathsForGET: (keyof typeof routes)[] = ["getCounter"];
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
          adapter: httpServerAdapter({ endpoint, pathsForGET }),
        }),
        () => new Response("tiny-rpc-skipped"),
      ),
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
        pathsForGET,
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
      "3",
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
      client.incrementCounter({ delta: "2" as any as number }),
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
      expect(e.cause).not.toBeInstanceOf(Error);
      expect(e.cause).toBeInstanceOf(Object);
      expect(e.cause).toMatchInlineSnapshot(`
        {
          "issues": [
            {
              "code": "invalid_type",
              "expected": "number",
              "message": "Expected number, received string",
              "path": [
                "delta",
              ],
              "received": "string",
            },
          ],
          "name": "ZodError",
        }
      `);
      return true;
    });

    // how error is wrapped on server side as a comparison
    expect(
      (async () => routes.incrementCounter({ delta: "2" as any as number }))(),
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
      tinyassert(e.cause instanceof ZodError);
      expect(e.cause).toMatchInlineSnapshot(`
        [ZodError: [
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
      },
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
      await fetch(url + "/non-endpoint").then((res) => res.text()),
    ).toMatchInlineSnapshot('"tiny-rpc-skipped"');

    // invalid method
    expect(
      await fetch(url + endpoint + "/getCounter", {
        method: "POST",
      }).then((res) => res.status),
    ).toMatchInlineSnapshot("405");

    expect(
      await fetch(url + endpoint + "/incrementCounter", {
        method: "GET",
      }).then((res) => res.status),
    ).toMatchInlineSnapshot("405");

    server.close();
  });

  describe("custom json", () => {
    const routes = {
      identity: (v: any) => v,
      validate: validateFn(z.number().int())((x) => 2 * x),
    };

    const testObject = {
      date: new Date("2023-08-17"),
      undefined: undefined,
      collision: "!undefined",
      NaN: NaN,
      Infinity: Infinity,
      regexp: /^\d+$/g,
    };

    it("json-extra", async () => {
      const { createJsonExtra, defineJsonExtraExtension } = await import(
        "@hiogawa/json-extra"
      );

      const jsonExtra = createJsonExtra({
        extensions: {
          ZodError: defineJsonExtraExtension<ZodError>({
            is: (v) => v instanceof ZodError,
            replacer: (v) => v.issues,
            reviver: (v) => new ZodError(v as any),
          }),
        },
        builtins: true,
      });

      //
      // server
      //
      const endpoint = "/rpc";
      const server = createServer(
        compose(
          (ctx) => {
            ctx.handleError = () => {
              return new Response(null, { status: 500 });
            };
          },
          exposeTinyRpc({
            routes: routes,
            adapter: httpServerAdapter({
              endpoint,
              JSON: jsonExtra,
            }),
          }),
          () => new Response("tiny-rpc-skipped"),
        ),
      );
      const { url } = await startTestServer(server);

      //
      // client
      //
      const client = proxyTinyRpc<typeof routes>({
        adapter: httpClientAdapter({
          url: url + endpoint,
          JSON: jsonExtra,
        }),
      });

      expect(await client.identity(testObject)).toEqual(testObject);
      expect(await client.validate(123)).toMatchInlineSnapshot("246");

      // error
      await expect(client.validate(123.456)).rejects.toSatisfy((e) => {
        tinyassert(e instanceof TinyRpcError);
        expect(e).toMatchInlineSnapshot(`
        [Error: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": []
          }
        ]]
      `);
        tinyassert(e.cause instanceof ZodError);
        expect(e.cause).toMatchInlineSnapshot(`
        [ZodError: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": []
          }
        ]]
      `);
        expect(e.cause.issues).toMatchInlineSnapshot(`
        [
          {
            "code": "invalid_type",
            "expected": "integer",
            "message": "Expected integer, received float",
            "path": [],
            "received": "float",
          },
        ]
      `);
        return true;
      });
    });

    it("brillout-json", async () => {
      // https://github.com/brillout/json-serializer
      // @ts-ignore no types?
      const { parse } = await import("@brillout/json-serializer/parse");
      // @ts-ignore
      const { stringify } = await import("@brillout/json-serializer/stringify");
      const brilloutJSON = { parse, stringify };

      //
      // server
      //
      const endpoint = "/rpc";
      const server = createServer(
        compose(
          (ctx) => {
            ctx.handleError = () => {
              return new Response(null, { status: 500 });
            };
          },
          exposeTinyRpc({
            routes,
            adapter: httpServerAdapter({
              endpoint,
              JSON: brilloutJSON,
            }),
          }),
          () => new Response("tiny-rpc-skipped"),
        ),
      );
      const { url } = await startTestServer(server);

      //
      // client
      //
      const client = proxyTinyRpc<typeof routes>({
        adapter: httpClientAdapter({
          url: url + endpoint,
          JSON: brilloutJSON,
        }),
      });
      expect(await client.identity(testObject)).toEqual(testObject);
      expect(await client.validate(123)).toMatchInlineSnapshot("246");

      // error
      await expect(client.validate(123.456)).rejects.toSatisfy((e) => {
        expect(e).toMatchInlineSnapshot(
          "[Error: Unexpected end of JSON input]",
        );
        return true;
      });
    });

    it("superjson", async () => {
      const superjson = await import("superjson");

      //
      // server
      //
      const endpoint = "/rpc";
      const server = createServer(
        compose(
          (ctx) => {
            ctx.handleError = () => {
              return new Response(null, { status: 500 });
            };
          },
          exposeTinyRpc({
            routes,
            adapter: httpServerAdapter({
              endpoint,
              JSON: superjson,
            }),
          }),
          () => new Response("tiny-rpc-skipped"),
        ),
      );
      const { url } = await startTestServer(server);

      //
      // client
      //
      const client = proxyTinyRpc<typeof routes>({
        adapter: httpClientAdapter({
          url: url + endpoint,
          JSON: superjson,
        }),
      });

      expect(await client.identity(testObject)).toEqual(testObject);
      expect(await client.validate(123)).toMatchInlineSnapshot("246");

      // ZodError without custom serializer
      await expect(client.validate(123.456)).rejects.toSatisfy((e) => {
        tinyassert(e instanceof TinyRpcError);
        expect(e).toMatchInlineSnapshot(`
        [Error: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": []
          }
        ]]
      `);
        tinyassert(e.cause instanceof Error);
        tinyassert(!(e.cause instanceof ZodError));
        expect(e.cause).toMatchInlineSnapshot(`
        [ZodError: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": []
          }
        ]]
      `);
        return true;
      });

      // ZodError with custom serializer
      superjson.registerCustom<ZodError, { issues: any }>(
        {
          isApplicable: (v): v is ZodError => v instanceof ZodError,
          serialize: (v) => ({ issues: v.issues }),
          deserialize: (v) => new ZodError(v.issues),
        },
        ZodError.name,
      );

      await expect(client.validate(123.456)).rejects.toSatisfy((e) => {
        tinyassert(e instanceof TinyRpcError);
        expect(e).toMatchInlineSnapshot(`
        [Error: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": []
          }
        ]]
      `);
        tinyassert(e.cause instanceof ZodError);
        expect(e.cause).toMatchInlineSnapshot(`
        [ZodError: [
          {
            "code": "invalid_type",
            "expected": "integer",
            "received": "float",
            "message": "Expected integer, received float",
            "path": []
          }
        ]]
      `);
        expect(e.cause.issues).toMatchInlineSnapshot(`
        [
          {
            "code": "invalid_type",
            "expected": "integer",
            "message": "Expected integer, received float",
            "path": [],
            "received": "float",
          },
        ]
      `);
        return true;
      });
    });
  });
});
