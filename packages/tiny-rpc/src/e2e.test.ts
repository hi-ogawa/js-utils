import { describe, expect, it } from "vitest";
import {
  type TinyRpcRoutes,
  createTinyRpcClientProxy,
  createTinyRpcHandler,
} from ".";

describe("e2e", () => {
  it("basic", () => {
    const endpoint = "/rpc";

    // define example rpc
    const routes = defineExampleRpc();

    // server
    const handler = createTinyRpcHandler({ endpoint, routes });
    handler;

    // client
    const client = createTinyRpcClientProxy<typeof routes>({ endpoint });
    client;

    expect;
  });
});

function defineExampleRpc() {
  let counter = 0;

  return {
    checkId: (id: string) => id === "good",

    getCounter: () => counter,

    updateCounter: (delta: number) => {
      counter += delta;
      return counter;
    },
  } satisfies TinyRpcRoutes;
}
