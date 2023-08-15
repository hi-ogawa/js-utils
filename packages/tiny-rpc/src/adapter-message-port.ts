import {
  type Result,
  newPromiseWithResolvers,
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
        const req = ev.data as RequestPayload; // TODO: validate
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
}: {
  port: TinyRpcMessagePort;
}): TinyRpcClientAdapter {
  return {
    send: async (data) => {
      const req: RequestPayload = {
        id: mathRandomId(),
        data,
      };
      const promiseResolvers = newPromiseWithResolvers<ResponsePayload>();
      const unlisten = listen(port, (ev) => {
        const res = ev.data as ResponsePayload;
        if (res.id === req.id) {
          promiseResolvers.resolve(res);
          unlisten();
        }
      });
      port.postMessage(req);
      const res = await promiseResolvers.promise;
      if (!res.result.ok) {
        throw TinyRpcError.fromUnknown(res.result.value);
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

// WebCrypto.randomUUID?
// collision check on server?
function mathRandomId() {
  return Math.floor(Math.random() * 2 ** 48)
    .toString(16)
    .padStart(12, "0");
}

function listen(port: TinyRpcMessagePort, listener: MessageHandler) {
  port.addEventListener("message", listener);
  return () => {
    port.removeEventListener("message", listener);
  };
}
