import { newPromiseWithResolvers } from "@hiogawa/utils";
import type { RpcClientAdapter, RpcPayload, RpcServerAdapter } from "./core";

// TODO:
// - propagate Error
// - how support "transferable"?
// - test

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
        const req = ev.data as EventRequestPayload; // TODO: validate
        const result = await invokeRoute(req.data);
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
        id: mathRandomUUID(),
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
      return res.result;
    },
  };
}

interface EventRequestPayload {
  id: string;
  data: RpcPayload;
}

interface EventResponsePayload {
  id: string;
  result: unknown;
}

// WebCrypto.randomUUID?
// collision check on server?
export function mathRandomUUID() {
  return [32, 16, 16, 16, 48]
    .map((bits) =>
      Math.floor(Math.random() * 2 ** bits)
        .toString(16)
        .padStart(bits / 4, "0")
    )
    .join("-");
}
