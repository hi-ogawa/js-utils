import { tinyassert } from "@hiogawa/utils";
import type { TinyRpcMessagePort } from "./adapter-message-port";

export interface TinyRpcMessagePortNode {
  postMessage(data: unknown, transferList?: ReadonlyArray<unknown>): void;
  on(type: "message", handler: NodeMessageHandler): void;
  off(type: "message", handler: NodeMessageHandler): void;
}

type NodeMessageHandler = (data: unknown) => void;

export function messagePortNodeCompat(
  port: TinyRpcMessagePortNode
): TinyRpcMessagePort {
  const map = new WeakMap();

  return {
    postMessage(data, options) {
      port.postMessage(data, options?.transfer);
    },

    addEventListener(type, handler) {
      const nodeHandler = (data: unknown) => handler({ data });
      map.set(handler, nodeHandler);
      port.on(type, nodeHandler);
    },

    removeEventListener(type, handler) {
      const nodeHandler = map.get(handler);
      map.delete(handler);
      tinyassert(nodeHandler);
      port.off(type, nodeHandler);
    },
  };
}
