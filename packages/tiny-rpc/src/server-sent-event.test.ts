import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { createManualPromise } from "@hiogawa/utils";
import { beforeAll, describe, expect, it } from "vitest";
import {
  TwoWaySseClient,
  TwoWaySseClientProxy,
  createTwoWaySseHandler,
} from "./server-sent-event";
import { startTestServer } from "./tests/helper";

beforeAll(async () => {
  // polyfill EventSource on NodeJS
  // @ts-ignore
  const { default: EventSource } = await import("eventsource");
  Object.assign(globalThis, { EventSource });
});

describe(createTwoWaySseHandler, () => {
  it("basic", async () => {
    const endpoint = "/sse";

    //
    // server
    //
    const clientProxyPromise = createManualPromise<TwoWaySseClientProxy>();
    const { handler } = createTwoWaySseHandler({
      endpoint,
      onConnection(client) {
        clientProxyPromise.resolve(client);
      },
    });
    const server = createServer(compose(handler));
    const { url } = await startTestServer(server);

    //
    // client
    //
    const client = await TwoWaySseClient.create({
      endpoint: url + endpoint,
    });
    const clientProxy = await clientProxyPromise;

    //
    // send message from server to client
    //
    const resultPromise = createManualPromise<unknown>();
    client.addEventListener("message", (e) => {
      resultPromise.resolve(e.data);
    });
    clientProxy.postMessage("hello");
    expect(await resultPromise).toMatchInlineSnapshot(`""hello""`);
  });
});
