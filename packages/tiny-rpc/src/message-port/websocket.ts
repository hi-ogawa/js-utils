import type {
  MessageHandler,
  TinyRpcMessagePort,
} from "../adapter-message-port";

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
