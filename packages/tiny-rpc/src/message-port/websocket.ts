import { tinyassert } from "@hiogawa/utils";
import type {
  MessageHandler,
  TinyRpcMessagePort,
} from "../adapter-message-port";

export class WebSocketMessagePort implements TinyRpcMessagePort {
  constructor(public ws: WebSocket) {}

  postMessage(data: unknown): void {
    this.ws.send(JSON.stringify(data));
  }

  // TODO: move (de)serialize to messagePortServerAdapter and messagePortClientAdapter
  private listenerMap = new WeakMap();

  addEventListener(type: "message", handler: MessageHandler): void {
    const wrapper: MessageHandler = async (ev) => {
      tinyassert(typeof ev.data === "string");
      handler({ data: JSON.parse(ev.data) });
    };
    this.ws.addEventListener(type, wrapper);
  }

  removeEventListener(type: "message", handler: MessageHandler): void {
    const wrapper = this.listenerMap.get(handler);
    this.ws.removeEventListener(type, wrapper);
    this.listenerMap.delete(handler);
  }
}
