import { createReactQueryOptionsProxy } from ".";
import { describe, it } from "vitest";

describe(createReactQueryOptionsProxy.name, () => {
  it("example", () => {
    // example definition
    let counter = 0;
    const api = {
      getCounter: () => counter,
      updateCounter: (delta: number) => {
        counter += delta;
        return counter;
      },
      checkId: (id: string) => id === "good",
    };

    // query-ify api
    const apiQuery = createReactQueryOptionsProxy(api);

    // type-check
    apiQuery.checkId.queryOptions satisfies (id: string) => {
      queryKey: unknown[];
      queryFn: (id: string) => Promise<boolean>;
    };

    apiQuery.updateCounter.mutationOptions satisfies () => {
      mutationKey: unknown[];
      mutationFn: (delta: number) => Promise<number>;
    };
  });
});
