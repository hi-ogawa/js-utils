import {
  type Result,
  createManualPromise,
  uniq,
  wrapErrorAsync,
} from "@hiogawa/utils";
import {
  type TinyRpcClientAdapter,
  TinyRpcError,
  type TinyRpcPayload,
  type TinyRpcServerAdapter,
} from "./core";

// TODO:
// - dispose?

//
// slim down MessagePort interface
// so that it's easy to generalize to "node:worker_threads" etc...
//

export interface TinyRpcMessagePort {
  postMessage(data: unknown, options?: postMessageOptions): void;
  addEventListener(type: "message", handler: MessageHandler): void;
  removeEventListener(type: "message", handler: MessageHandler): void;
}

// cf. StructuredSerializeOptions
type postMessageOptions = {
  transfer?: unknown[];
};

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
        let transfer!: unknown[];
        const result = await wrapErrorAsync(async () => {
          let ret = await invokeRoute(req.data);
          [ret, transfer] = unwrapTransfer(ret);
          return ret;
        });
        if (!result.ok) {
          onError?.(result.value);
          result.value = TinyRpcError.fromUnknown(result.value).serialize();
        }
        const res: ResponsePayload = {
          id: req.id,
          result,
        };
        port.postMessage(res, { transfer });
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
      const unwraped = data.args.map((arg) => unwrapTransfer(arg));
      const args = unwraped.map(([arg]) => arg);
      const transfer = uniq(unwraped.flatMap(([_, t]) => t));
      const req: RequestPayload = {
        id: generateId(),
        data: { ...data, args },
      };
      const responsePromise = createManualPromise<ResponsePayload>();
      const unlisten = listen(port, (ev) => {
        const res = ev.data as ResponsePayload;
        if (res.id === req.id) {
          responsePromise.resolve(res);
          unlisten();
        }
      });
      port.postMessage(req, { transfer });
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

class WrapepdTransfer {
  constructor(public inner: [unknown, unknown[]]) {}
}

export function messagePortWrapTransfer<T>(
  value: T,
  transferables: unknown[]
): T {
  return new WrapepdTransfer([value, transferables]) as any;
}

function unwrapTransfer(value: unknown): [unknown, unknown[]] {
  if (value instanceof WrapepdTransfer) {
    return value.inner;
  }
  return [value, []];
}
