import { exposeTinyRpc, httpServerAdapter } from "@hiogawa/tiny-rpc";

let __counter = 0;

export const serverRpc = {
  getCounter: async () => {
    return __counter;
  },
  incrementCounter: async (delta: number) => {
    __counter += delta;
    return __counter;
  },
};

export const rpcHandler = exposeTinyRpc({
  routes: serverRpc,
  adapter: httpServerAdapter({
    endpoint: "/__rpc",
    onError(e) {
      console.error(e);
    },
  }),
});
