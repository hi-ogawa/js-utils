import { createServer } from "node:http";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, test } from "vitest";
import { webToNodeHandler } from "./http";

describe(webToNodeHandler, () => {
  test("basic", async () => {
    const handler = webToNodeHandler((request) => {
      return new Response("hello = " + request.url, {
        headers: { "content-type": "text/x-hello" },
      });
    });
    await using server = await testServer(
      createServer((req, res) => handler(req, res, () => res.end("[next]")))
    );
    const res = await fetch(server.url);
    expect(res.headers.get("content-type")).toMatchInlineSnapshot(`null`);
    expect(await res.text()).toMatchInlineSnapshot(`"[next]"`);
  });
});

export async function testServer(server: import("node:http").Server) {
  // listen
  await new Promise<void>((resolve) => server.listen(() => resolve()));

  // get address
  const address = server.address();
  tinyassert(address);
  tinyassert(typeof address !== "string");
  const url = `http://localhost:${address.port}`;

  return {
    server,
    url,
    [Symbol.asyncDispose]: () => server[Symbol.asyncDispose](),
  };
}
