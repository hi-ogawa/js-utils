import { createTRPCProxyClient } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { describe, it } from "vitest";
import { z } from "zod";
import { createFnRecordQueryProxy } from "./record";
import { createTrpcClientQueryProxy, trpcCallerFnRecordCompat } from "./trpc";

// example trpc server
function defineExampleServer() {
  let counter = 0;

  const t = initTRPC.create();
  const server = t.router({
    checkId: t.procedure.input(z.string()).query(({ input }) => {
      return input === "good";
    }),

    getCounter: t.procedure.query(() => counter),

    updateCounter: t.procedure.input(z.number()).query(({ input }) => {
      counter += input;
      return counter;
    }),
  });

  return server;
}

describe(createTrpcClientQueryProxy.name, () => {
  it("client", async () => {
    // trpc server/client
    const server = defineExampleServer();
    const client = createTRPCProxyClient<typeof server>({ links: [] });

    // client query proxy
    const clientQuery = createTrpcClientQueryProxy<typeof server>(client);

    // type-check
    clientQuery.checkId.queryOptions satisfies (id: string) => {
      queryKey: unknown[];
      queryFn: (id: string) => Promise<boolean>;
    };

    clientQuery.updateCounter.mutationOptions satisfies () => {
      mutationKey: unknown[];
      mutationFn: (delta: number) => Promise<number>;
    };
  });
});

describe(createFnRecordQueryProxy.name, () => {
  it("caller", () => {
    // trpc server/caller
    const server = defineExampleServer();
    const caller = server.createCaller({});

    // caller is just FnRecord but requires a small type hacking
    const callerQuery = createFnRecordQueryProxy(
      trpcCallerFnRecordCompat(caller)
    );

    // type-check
    callerQuery.checkId.queryOptions satisfies (id: string) => {
      queryKey: unknown[];
      queryFn: (id: string) => Promise<boolean>;
    };

    callerQuery.updateCounter.mutationOptions satisfies () => {
      mutationKey: unknown[];
      mutationFn: (delta: number) => Promise<number>;
    };
  });
});
