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
  // @ts-ignore
  const { default: EventSource } = await import("eventsource");
  Object.assign(globalThis, { EventSource });
});

describe("server-sent-event", () => {
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
    console.log({ url });
    const client = await TwoWaySseClient.create({
      endpoint: url + endpoint,
    });
    const clientProxy = await clientProxyPromise;

    //
    // send message from server to client
    //
    // await
    client.addEventListener("message", (e) => {
      e.data;
    });
    clientProxy.postMessage("hello");
    expect;
  });
});
