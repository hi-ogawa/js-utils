import {
  type Result,
  newPromiseWithResolvers,
  wrapErrorAsync,
} from "@hiogawa/utils";
import type { RpcClientAdapter, RpcPayload, RpcServerAdapter } from "./core";

// TODO:
// - propagate Error
// - how to support "transferable"?

export function messagePortServerAdapter({
  port,
}: {
  port: MessagePort;
  // TODO
  // onError?
}): RpcServerAdapter<void> {
  return {
    on: (invokeRoute) => {
      // TODO port.removeEventListener

      // TODO: async handler caveat
      port.addEventListener("message", async (ev) => {
        ev.data;
        const req = ev.data as EventRequestPayload; // TODO: validate
        const result = await wrapErrorAsync(async () => invokeRoute(req.data));
        const res: EventResponsePayload = {
          id: req.id,
          result,
        };
        port.postMessage(res);
      });

      // TODO
      port.addEventListener("messageerror", (ev) => {
        ev;
      });
    },
  };
}

export function messagePortClientAdapter({
  port,
}: {
  port: MessagePort;
  // TODO
  // onError?
}): RpcClientAdapter {
  // TODO:
  port.addEventListener("messageerror", (ev) => {
    ev;
  });

  return {
    post: async (data) => {
      const req: EventRequestPayload = {
        id: mathRandomId(),
        data,
      };

      const promiseResolvers = newPromiseWithResolvers<EventResponsePayload>();

      async function handler(ev: MessageEvent) {
        const res = ev.data as EventResponsePayload;
        if (res.id === req.id) {
          promiseResolvers.resolve(res);
          port.removeEventListener("message", handler);
        }
      }

      port.addEventListener("message", handler);
      port.postMessage(req);
      const res = await promiseResolvers.promise;
      if (!res.result.ok) {
        throw new Error("rpc error", { cause: res.result.value });
      }
      return res.result.value;
    },
  };
}

interface EventRequestPayload {
  id: string;
  data: RpcPayload;
}

interface EventResponsePayload {
  id: string;
  result: Result<unknown, unknown>;
}

// WebCrypto.randomUUID?
// collision check on server?
export function mathRandomId() {
  return Math.floor(Math.random() * 2 ** 48)
    .toString(16)
    .padStart(12, "0");
}
