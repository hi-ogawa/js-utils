import * as readline from "node:readline";
import { createMiddleware } from "@hattip/adapter-node/native-fetch";
import { compose } from "@hattip/compose";
import { createTwoWaySseHandler } from "@hiogawa/tiny-rpc";
import { type BirpcReturn, createBirpc } from "birpc";
import type { ClientRpc } from "./client";

const serverRpc = {
  hi: (name: string) => {
    console.log("[serverRpc.hi]", name);
    return `Hi ${name} from server`;
  },
};

export type ServerRpc = typeof serverRpc;

let clientRpcProxy: BirpcReturn<ClientRpc, {}> | undefined;

const sseHandler = createTwoWaySseHandler({
  endpoint: "/__sse__",
  onConnection(client) {
    clientRpcProxy = createBirpc<ClientRpc, ServerRpc>(serverRpc, {
      post: (data) => client.postMessage(data),
      on: (onData) =>
        client.addEventListener("message", (ev) => onData(ev.data)),
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      eventNames: ["onLine"],
    });
    console.log("[server] client connected");
  },
});

// watch terminal input
const input = process.stdin;
const rl = readline.createInterface({ input });
rl.on("line", (line) => {
  clientRpcProxy?.onLine(line);
});

const staticHandler = () => {
  const html = `
    <script type="module" src="/@vite/client"></script>
    <script src="/src/client.ts" type="module"></script>
    <div>
      <button id="hi-server">Hi Server</button>
      <input id="hi-server-request" placeholder="request" />
      <input id="hi-server-response" placeholder="response" readonly />
    </div>
    <div>
      <h5>type and press enter in terminal</h5>
      <input id="terminal" readonly />
    </div>
  `;
  return new Response(html, { headers: { "content-type": "text/html" } });
};

export default createMiddleware(compose(sseHandler.handler, staticHandler));
