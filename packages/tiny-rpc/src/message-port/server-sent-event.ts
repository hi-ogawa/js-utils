import { createManualPromise, tinyassert } from "@hiogawa/utils";
import type { RequestHandler } from "../adapter-http";
import {
  type MessageHandler,
  type TinyRpcMessagePort,
  defaultGenerateId,
} from "../adapter-message-port";
import { TypedEventTarget, subscribe } from "./utils";

// MessagePort like two way connection
// implemented on top of server sent events (SSE)
// https://github.com/websockets/ws
// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
// https://github.com/Azure/fetch-event-source

export class TwoWaySseClient implements TinyRpcMessagePort {
  constructor(
    public source: EventSource,
    public endpoint: string,
    public id: string,
  ) {}

  static async create({ endpoint }: { endpoint: string }) {
    // TODO: generate id on server
    const id = defaultGenerateId();
    const source = new EventSource(endpoint + "?id=" + id);

    const promise = createManualPromise<void>();
    const dispose1 = subscribe(source, "open", () => {
      promise.resolve();
    });
    const dispose2 = subscribe(source, "error", (e) => {
      console.error("[TwoWaySseClient.create]", e);
      promise.reject(
        new Error("[TwoWaySseClient.create] failed to open EventSource"),
      );
    });
    try {
      await promise;
      return new TwoWaySseClient(source, endpoint, id);
    } finally {
      dispose1();
      dispose2();
    }
  }

  postMessage(data: unknown) {
    const inner = async () => {
      tinyassert(typeof data === "string");
      const res = await fetch(this.endpoint + "?id=" + this.id, {
        method: "POST",
        body: data,
      });
      tinyassert(res.ok);
      const resJson = await res.json();
      tinyassert(resJson.ok);
    };

    inner().catch((e) => {
      console.error("[TwoWaySseClient.postMessage]", e);
    });
  }

  addEventListener(type: "message", handler: MessageHandler) {
    this.source.addEventListener(type, handler);
  }

  removeEventListener(type: "message", handler: MessageHandler) {
    this.source.removeEventListener(type, handler);
  }
}

interface TwoWaySseClientProxyEventMap {
  message: { data: unknown };
  close: {};
}

export class TwoWaySseClientProxy
  extends TypedEventTarget<TwoWaySseClientProxyEventMap>
  implements TinyRpcMessagePort
{
  stream: ReadableStream<string>;
  controller!: ReadableStreamDefaultController<string>;
  closed = false;

  constructor(opts: { onClose: () => void }) {
    super();

    // cf. hattip serverSentEvents
    // https://github.com/hattipjs/hattip/blob/b8697cb360c16609eff560cff7993da114b5022c/packages/base/response/src/index.ts#L130
    this.stream = new ReadableStream<string>({
      start: (controller) => {
        this.controller = controller;
        this.controller.enqueue(`:ping\n\n`);
      },
      cancel: () => {
        this.closed = true;
        opts.onClose();
        clearTimeout(interval);
        this.notify("close", {});
      },
    });

    // auto ping from server
    const interval = setInterval(() => {
      this.controller.enqueue(`:ping\n\n`);
    }, 10_000);
  }

  postMessage(data: unknown) {
    if (this.closed) {
      throw new Error("[TwoWaySseClientProxy.postMessage] already closed");
    }
    tinyassert(typeof data === "string");
    this.controller.enqueue(`data: ${data}\n\n`);
  }
}

export function createTwoWaySseHandler(opts: {
  endpoint: string;
  onConnection: (client: TwoWaySseClientProxy) => void;
}) {
  // TODO: cannot close from server? (need to access node's http.ServerResponse?)
  const clientMap = new Map<string, TwoWaySseClientProxy>();

  const handler: RequestHandler = async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (url.pathname === opts.endpoint) {
      if (request.method === "POST") {
        tinyassert(id);
        const client = clientMap.get(id);
        tinyassert(client);
        client.notify("message", { data: await request.text() });
        return new Response(JSON.stringify({ ok: true }));
      }

      if (request.method === "GET") {
        tinyassert(id);
        tinyassert(!clientMap.has(id));

        const client = new TwoWaySseClientProxy({
          onClose: () => {
            clientMap.delete(id);
          },
        });
        clientMap.set(id, client);

        opts.onConnection(client);

        return new Response(client.stream, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            connection: "keep-alive",
          },
        });
      }
    }
    return;
  };

  return { clientMap, handler };
}
