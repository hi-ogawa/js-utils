export const rpc = {};
// import {} from "vite"

// import { rpc } from "./rpc"
// import

//
// for server-action-like RPC based on tiny-rpc
//

function vitePluginVirtualByEnv({
  virtual,
  client,
  server,
}: {
  virtual: string;
  client?: string;
  server?: string;
}): Plugin {
  return {
    name: vitePluginVirtualByEnv.name,
    resolveId(source, _importer, options) {
      if (source === virtual) {
        if (options.ssr && server) {
          return "\0" + virtual;
        }
        if (!options.ssr && client) {
          return "\0" + virtual;
        }
      }
      return;
    },
    load(id, options) {
      if (id === "\0" + virtual) {
        return options?.ssr ? server : client;
      }
      return;
    },
  };
}

function vitePluginRpc() {
  return vitePluginVirtualByEnv({
    virtual: "virtual:rpc",
    client: `export { clientRpc as rpc } from "/src/rpc/client"`,
    server: `export { serverRpc as rpc } from "/src/rpc/server"`,
  })
}
