import type {
  MessageHandler,
  TinyRpcMessagePort,
} from "../adapter-message-port";

// TODO: rework adapter-message-port api, so we don't need this silly wrapper...
export class WebSocketMessagePort implements TinyRpcMessagePort {
  constructor(public ws: WebSocket) {}

  postMessage(data: unknown): void {
    this.ws.send(data as any);
  }

  addEventListener(type: "message", handler: MessageHandler): void {
    this.ws.addEventListener(type, handler);
  }

  removeEventListener(type: "message", handler: MessageHandler): void {
    this.ws.removeEventListener(type, handler);
  }
}
