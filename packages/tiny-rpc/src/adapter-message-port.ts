import {
  type Result,
  createManualPromise,
  wrapErrorAsync,
} from "@hiogawa/utils";
import {
  type TinyRpcClientAdapter,
  TinyRpcError,
  type TinyRpcPayload,
  type TinyRpcServerAdapter,
} from "./core";

// TODO:
// - support "transferable"?
// - dispose?

//
// slim down MessagePort interface
// so that it's easy to generalize to "node:worker_threads" etc...
//

export interface TinyRpcMessagePort {
  postMessage(data: unknown): void;
  addEventListener(type: "message", handler: MessageHandler): void;
  removeEventListener(type: "message", handler: MessageHandler): void;
}

type MessageHandler = (ev: { data: unknown }) => void;

//
// adapter
//

export function messagePortServerAdapter({
  port,
  onError,
}: {
  port: TinyRpcMessagePort;
  onError?: (e: unknown) => void;
}): TinyRpcServerAdapter<() => void> {
  return {
    register: (invokeRoute) => {
      // TODO: async handler caveat
      return listen(port, async (ev) => {
        // TODO: collision check req.id on server?
        const req = ev.data as RequestPayload;
        const result = await wrapErrorAsync(async () => invokeRoute(req.data));
        if (!result.ok) {
          onError?.(result.value);
          result.value = TinyRpcError.fromUnknown(result.value).serialize();
        }
        const res: ResponsePayload = {
          id: req.id,
          result,
        };
        port.postMessage(res);
      });
    },
  };
}

export function messagePortClientAdapter({
  port,
  generateId = defaultGenerateId,
}: {
  port: TinyRpcMessagePort;
  generateId?: () => string;
}): TinyRpcClientAdapter {
  return {
    send: async (data) => {
      const req: RequestPayload = {
        id: generateId(),
        data,
      };
      const responsePromise = createManualPromise<ResponsePayload>();
      const unlisten = listen(port, (ev) => {
        const res = ev.data as ResponsePayload;
        if (res.id === req.id) {
          responsePromise.resolve(res);
          unlisten();
        }
      });
      port.postMessage(req);
      const res = await responsePromise;
      if (!res.result.ok) {
        throw TinyRpcError.deserialize(res.result.value);
      }
      return res.result.value;
    },
  };
}

interface RequestPayload {
  id: string;
  data: TinyRpcPayload;
}

interface ResponsePayload {
  id: string;
  result: Result<unknown, unknown>;
}

function defaultGenerateId() {
  if (typeof globalThis?.crypto?.randomUUID !== "undefined") {
    return globalThis.crypto.randomUUID();
  }
  return mathRandomId();
}

// cheap fallback id
function mathRandomId() {
  return [32, 16, 16, 16, 48]
    .map((bits) =>
      Math.floor(Math.random() * 2 ** bits)
        .toString(16)
        .padStart(bits / 4, "0")
    )
    .join("-");
}

function listen(port: TinyRpcMessagePort, listener: MessageHandler) {
  port.addEventListener("message", listener);
  return () => {
    port.removeEventListener("message", listener);
  };
}
