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

export function messagePortServerAdapter({
  port,
  onError,
}: {
  port: MessagePort;
  onError?: (e: unknown) => void;
}): RpcServerAdapter<() => void> {
  return {
    on: (invokeRoute) => {
      // TODO: async handler caveat
      return listen(port, "message", async (ev) => {
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
  port: MessagePort;
}): RpcClientAdapter {
  return {
    post: async (data) => {
      const req: RequestPayload = {
        id: mathRandomId(),
        data,
      };
      const promiseResolvers = newPromiseWithResolvers<ResponsePayload>();
      const unlisten = listen(port, "message", (ev) => {
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

function listen<K extends keyof MessagePortEventMap>(
  port: MessagePort,
  type: K,
  listener: (ev: MessagePortEventMap[K]) => unknown
) {
  port.addEventListener(type, listener);
  return () => {
    port.removeEventListener(type, listener);
  };
}
