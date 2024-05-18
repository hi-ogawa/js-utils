import { createServer } from "node:http";
import { createManualPromise, tinyassert } from "@hiogawa/utils";
import { describe, expect, test, vi } from "vitest";
import { type WebHandler, webToNodeHandler } from "./http";

describe(webToNodeHandler, () => {
  test("basic", async () => {
    const abortFn = vi.fn();
    await using server = await testWebHandler((request) => {
      request.signal.addEventListener("abort", () => {
        abortFn("abort");
      });
      const body = "hello = " + new URL(request.url).pathname;
      return new Response(body, {
        headers: { "content-type": "text/x-hello" },
      });
    });
    const res = await fetch(server.url + "/abc");

    expect(server.nextFn.mock.calls).toMatchInlineSnapshot(`[]`);
    expect(abortFn.mock.calls).toMatchInlineSnapshot(`[]`);
    expect(res.headers.get("content-type")).toMatchInlineSnapshot(
      `"text/x-hello"`
    );
    expect(await res.text()).toMatchInlineSnapshot(`"hello = /abc"`);
  });

  test("stream abort", async () => {
    // https://github.com/hi-ogawa/reproductions/pull/9

    const trackFn = vi.fn();
    const abortPromise = createManualPromise<void>();
    const cancelPromise = createManualPromise<void>();
    async function handler(req: Request) {
      let aborted = false;
      req.signal.addEventListener("abort", () => {
        trackFn("abort");
        abortPromise.resolve();
        aborted = true;
      });

      let cancelled = false;
      const stream = new ReadableStream<string>({
        async start(controller) {
          for (let i = 0; !aborted && !cancelled; i++) {
            controller.enqueue(`i = ${i}\n`);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
          controller.close();
        },
        cancel() {
          trackFn("cancel");
          cancelPromise.resolve();
          cancelled = true;
        },
      });

      return new Response(stream.pipeThrough(new TextEncoderStream()));
    }

    await using server = await testWebHandler(handler);
    const abortController = new AbortController();
    const res = await fetch(server.url, { signal: abortController.signal });
    tinyassert(res.ok);
    tinyassert(res.body);
    const chunks: string[] = [];
    const promise = res.body.pipeThrough(new TextDecoderStream()).pipeTo(
      new WritableStream({
        write(chunk) {
          chunks.push(chunk);
          if (chunk.includes("i = 2")) {
            abortController.abort();
          }
        },
      })
    );
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[AbortError: This operation was aborted]`
    );
    expect(chunks).toMatchInlineSnapshot(`
      [
        "i = 0
      ",
        "i = 1
      ",
        "i = 2
      ",
      ]
    `);
    await Promise.all([abortPromise, cancelPromise]);
    expect(trackFn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "abort",
        ],
        [
          "cancel",
        ],
      ]
    `);
    expect(server.nextFn.mock.calls).toMatchInlineSnapshot(`[]`);
  });

  test("stream close itself", async () => {
    const trackFn = vi.fn();
    const abortPromise = createManualPromise<void>();
    const cancelPromise = createManualPromise<void>();
    async function handler(req: Request) {
      req.signal.addEventListener("abort", () => {
        trackFn("abort");
        abortPromise.resolve();
      });

      const stream = new ReadableStream<string>({
        async start(controller) {
          for (let i = 0; i < 3; i++) {
            controller.enqueue(`i = ${i}\n`);
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
          controller.close();
        },
        cancel() {
          trackFn("cancel");
          cancelPromise.resolve();
        },
      });

      return new Response(stream.pipeThrough(new TextEncoderStream()));
    }

    await using server = await testWebHandler(handler);
    const res = await fetch(server.url);
    tinyassert(res.ok);
    tinyassert(res.body);
    const chunks: string[] = [];
    await res.body.pipeThrough(new TextDecoderStream()).pipeTo(
      new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      })
    );
    expect(chunks).toMatchInlineSnapshot(`
      [
        "i = 0
      ",
        "i = 1
      ",
        "i = 2
      ",
      ]
    `);
    expect(trackFn.mock.calls).toMatchInlineSnapshot(`[]`);
    expect(server.nextFn.mock.calls).toMatchInlineSnapshot(`[]`);
  });
});

async function testWebHandler(handler: WebHandler) {
  // node server
  const nextFn = vi.fn();
  const nodeHandler = webToNodeHandler(handler);
  const server = createServer((req, res) => nodeHandler(req, res, nextFn));

  // listen
  await new Promise<void>((resolve) => server.listen(() => resolve()));

  // get address
  const address = server.address();
  tinyassert(address);
  tinyassert(typeof address !== "string");
  const url = `http://localhost:${address.port}`;

  return {
    url,
    nextFn,
    [Symbol.asyncDispose]: () => server[Symbol.asyncDispose](),
  };
}
