declare module "virtual:rpc" {
  export const rpc: typeof import("./server")["serverRpc"];
}
