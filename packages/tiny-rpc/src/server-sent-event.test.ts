import { createServer } from "@hattip/adapter-node";
import { compose } from "@hattip/compose";
import { createManualPromise } from "@hiogawa/utils";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { beforeAll, describe, expect, it } from "vitest";
import {
  TwoWaySseClient,
  TwoWaySseClientProxy,
  TypedEventTarget,
  createTwoWaySseHandler,
} from "./server-sent-event";
import { startTestServer } from "./tests/helper";

// EventSource polyfill based on https://github.com/Azure/fetch-event-source
class FetchEventSource extends TypedEventTarget<EventSourceEventMap> {
  public fetchPromise: Promise<void>;

  constructor(public url: string) {
    super();
    console.log("[FetchEventSource]", { url });
    this.fetchPromise = fetchEventSource(url, {
      fetch: globalThis.fetch,
      openWhenHidden: true,
      onopen: async (response) => {
        console.log("[onopen]");
        this.notify("open", response as any);
      },
      onerror: (e) => {
        console.log("[onerror]");
        this.notify("error", e);
      },
      onmessage: (ev) => {
        console.log("[onmessage]");
        this.notify("message", ev as any);
      },
      onclose: () => {
        console.log("[onclose]");
      },
    });
  }
}

beforeAll(async () => {
  Object.assign(globalThis, { EventSource: FetchEventSource });
  // @ts-ignore
  // const { default: EventSource } = await import("eventsource");
  // Object.assign(globalThis, { EventSource });
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
    const server = createServer(
      compose(
        (ctx) => {
          ctx.handleError = () => {
            return new Response(null, { status: 500 });
          };
        },
        handler,
        () => new Response("tiny-rpc-skipped")
      ),
      {
        alwaysCallNext: false,
      },
      {}
    );
    const { url } = await startTestServer(server);

    //
    // client
    //
    console.log({ url });
    const client = await TwoWaySseClient.create({
      endpoint: url + endpoint,
    });
    console.log({ client });
    const clientProxy = await clientProxyPromise;
    console.log({ clientProxy });

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
