import { createServer } from "node:http";
import { tinyassert } from "@hiogawa/utils";
import { describe, expect, test } from "vitest";
import { webToNodeHandler } from "./http";

describe(webToNodeHandler, () => {
  test("basic", async () => {
    const handler = webToNodeHandler((request) => {
      return new Response("hello = " + new URL(request.url).pathname, {
        headers: { "content-type": "text/x-hello" },
      });
    });
    await using server = await testServer(
      createServer((req, res) =>
        handler(req, res, (e) => {
          console.error(e);
          res.end("[next]");
        })
      )
    );
    const res = await fetch(server.url + "/abc");
    expect(res.headers.get("content-type")).toMatchInlineSnapshot(
      `"text/x-hello"`
    );
    expect(await res.text()).toMatchInlineSnapshot(`"hello = /abc"`);
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
