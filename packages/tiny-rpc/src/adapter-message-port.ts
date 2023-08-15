import {
  type Result,
  newPromiseWithResolvers,
  wrapErrorAsync,
} from "@hiogawa/utils";
import type { RpcClientAdapter, RpcPayload, RpcServerAdapter } from "./core";

// TODO:
// - propagate custom Error (custom serialize/deserialize?)
// - support "transferable"?
// - dispose listener?
// - initial hand-shake helper?
// - direct support of `WebWorker` and `node:worker_threads`

//
// require only a subset of MessagePort
//

export interface TinyRpcAdapterMessagePort {
  postMessage(data: unknown): void;
  addEventListener(type: "message", handler: MessageHandler): void;
  removeEventListener(type: "message", handler: MessageHandler): void;
}

type MessageHandler = (ev: { data: unknown }) => void;

function listen(port: TinyRpcAdapterMessagePort, listener: MessageHandler) {
  port.addEventListener("message", listener);
  return () => {
    port.removeEventListener("message", listener);
  };
}

//
// adapter
//

export function messagePortServerAdapter({
  port,
  onError,
}: {
  port: TinyRpcAdapterMessagePort;
  onError?: (e: unknown) => void;
}): RpcServerAdapter<() => void> {
  return {
    on: (invokeRoute) => {
      // TODO: async handler caveat
      return listen(port, async (ev) => {
        const req = ev.data as RequestPayload; // TODO: validate
        const result = await wrapErrorAsync(async () => invokeRoute(req.data));
        if (!result.ok && onError) {
          onError(result.value);
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
  port: TinyRpcAdapterMessagePort;
}): RpcClientAdapter {
  return {
    post: async (data) => {
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
        throw res.result.value;
      }
      return res.result.value;
    },
  };
}

interface RequestPayload {
  id: string;
  data: RpcPayload;
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
