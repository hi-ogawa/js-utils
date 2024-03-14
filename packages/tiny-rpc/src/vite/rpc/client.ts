import { httpClientAdapter, proxyTinyRpc } from "@hiogawa/tiny-rpc";

export const clientRpc = proxyTinyRpc({
  adapter: httpClientAdapter({
    url: "/__rpc",
  }),
});
