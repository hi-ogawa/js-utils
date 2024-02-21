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

// watch terminal input and notify client
const input = process.stdin;
const rl = readline.createInterface({ input });
rl.on("line", (line) => {
  clientRpcProxy?.onLine(line);
});

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

const staticHandler = () => {
  const html = `
    <script type="module" src="/@vite/client"></script>
    <script src="/src/client.ts" type="module"></script>
    <div>
      <h5>From client to server</h5>
      <button id="hi-server">serverRpc.hi</button>
      <input id="hi-server-request" placeholder="request" />
      <input id="hi-server-response" placeholder="response" readonly />
    </div>
    <div>
      <h5>From server to client (type and press enter in terminal)</h5>
      <input id="terminal" placeholder="clientRpc.onLine" readonly />
    </div>
  `;
  return new Response(html, { headers: { "content-type": "text/html" } });
};

export default createMiddleware(compose(sseHandler.handler, staticHandler));
