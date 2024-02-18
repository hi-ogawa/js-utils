import { DefaultMap, createManualPromise, tinyassert } from "@hiogawa/utils";
import type { RequestHandler } from "./adapter-http";
import {
  type TinyRpcMessagePort,
  defaultGenerateId,
} from "./adapter-message-port";

// WebSocket-like two way connection interface
// implemented on top of server sent events (SSE)
// https://github.com/websockets/ws
// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
// https://github.com/Azure/fetch-event-source

export class TwoWaySseClient implements TinyRpcMessagePort {
  constructor(
    public source: EventSource,
    public endpoint: string,
    public id: string
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
        new Error("[TwoWaySseClient.create] failed to open EventSource")
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
      const res = await fetch(this.endpoint + "?id=" + this.id, {
        method: "POST",
        body: JSON.stringify(data),
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

type MessageHandler = (ev: { data: unknown }) => void;

function subscribe<K extends keyof EventSourceEventMap>(
  target: EventSource,
  type: K,
  listener: (ev: EventSourceEventMap[K]) => void
) {
  target.addEventListener(type, listener);
  return () => {
    target.addEventListener(type, listener);
  };
}

interface TwoWaySseClientProxyEventMap {
  message: { data: unknown };
  close: {};
}

class EventListerManager<T> {
  private listeners = new DefaultMap<keyof T, Set<Function>>(() => new Set());

  addEventListener<K extends keyof T>(type: K, listener: (ev: T[K]) => void) {
    this.listeners.get(type).add(listener);
  }

  removeEventListener<K extends keyof T>(
    type: K,
    listener: (ev: T[K]) => void
  ) {
    this.listeners.get(type).delete(listener);
  }

  notify<K extends keyof T>(type: K, data: T[K]) {
    for (const listener of this.listeners.get(type)) {
      listener(data);
    }
  }
}

export class TwoWaySseClientProxy
  extends EventListerManager<TwoWaySseClientProxyEventMap>
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
      },
      cancel: () => {
        this.closed = true;
        opts.onClose();
        clearTimeout(interval);
        this.notify("close", {});
      },
    });

    // auto server ping
    const interval = setInterval(() => {
      this.controller.enqueue(`:ping\n\n`);
    }, 10_000);
  }

  postMessage(data: unknown) {
    if (this.closed) {
      throw new Error("[TwoWaySseClientProxy.postMessage] already closed");
    }
    this.controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
  }
}

export function createTwoWaySseHandler(opts: {
  endpoint: string;
  onConnection: (client: TwoWaySseClientProxy) => void;
}) {
  const clientMap = new Map<string, TwoWaySseClientProxy>();

  const handler: RequestHandler = async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (url.pathname === opts.endpoint) {
      if (request.method === "POST") {
        tinyassert(id);
        const client = clientMap.get(id);
        tinyassert(client);
        client.notify("message", { data: await request.json() });
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
