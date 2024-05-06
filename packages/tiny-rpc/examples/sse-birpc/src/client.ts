import { TwoWaySseClient } from "@hiogawa/tiny-rpc";
import { createBirpc } from "birpc";
import type { ServerRpc } from "./server";

const $ = document.querySelector.bind(document);

const clientRpc = {
  onLine: (input: string) => {
    $("#terminal").value = input;
  },
};

export type ClientRpc = typeof clientRpc;

const client = await TwoWaySseClient.create({
  endpoint: "/__sse__",
});

const serverRpcProxy = createBirpc<ServerRpc, ClientRpc>(clientRpc, {
  post: (data) => client.postMessage(data),
  on: (onData) => client.addEventListener("message", (ev) => onData(ev.data)),
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

$("#hi-server").addEventListener("click", () => {
  hiServer();
});
($("#hi-server-request") as HTMLInputElement).addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    hiServer();
  }
});

async function hiServer() {
  const req = $("#hi-server-request").value || "...";
  const res = await serverRpcProxy.hi(req);
  $("#hi-server-response").value = res;
}
