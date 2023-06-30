import { describe, expect, it } from "vitest";
import { createTinyRpcClientProxy } from "./client";
import { createTinyRpcHandler } from "./server";

describe("e2e", () => {
  it("basic", () => {
    const endpoint = "/rpc";

    //
    // define rpc routes
    //
    let counter = 0;
    const routes = {
      checkId: (id: string) => id === "good",

      getCounter: () => counter,

      updateCounter: (delta: number) => {
        counter += delta;
        return counter;
      },
    };

    const client = createTinyRpcClientProxy<typeof routes>({ endpoint });
    client.getCounter();

    const handler = createTinyRpcHandler({ endpoint, routes });
    handler;

    expect;
  });
});
