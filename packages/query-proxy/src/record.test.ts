import { MutationOptions, QueryClient } from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { createFnRecordReactQueryProxy } from "./record";

describe(createFnRecordReactQueryProxy.name, () => {
  it("example", async () => {
    //
    // FnRecord "service"
    //

    let counter = 0;

    const fnRecord = {
      checkId: (id: string) => id === "good",

      getCounter: () => counter,

      updateCounter: (delta: number) => {
        counter += delta;
        return counter;
      },
    };

    //
    // use Service via QueryClient
    //
    const fnRecordQuery = createFnRecordReactQueryProxy(fnRecord);

    // type-check
    fnRecordQuery.checkId.queryOptions satisfies (id: string) => {
      queryKey: unknown[];
      queryFn: (id: string) => Promise<boolean>;
    };

    fnRecordQuery.updateCounter.mutationOptions satisfies () => {
      mutationKey: unknown[];
      mutationFn: (delta: number) => Promise<number>;
    };

    const queryClient = new QueryClient();

    expect(
      await queryClient.fetchQuery(fnRecordQuery.checkId.queryOptions("bad"))
    ).toMatchInlineSnapshot("false");

    expect(
      await queryClient.fetchQuery(fnRecordQuery.checkId.queryOptions("good"))
    ).toMatchInlineSnapshot("true");

    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((e) => ({ queryKey: e.queryKey, data: e.state.data }))
    ).toMatchInlineSnapshot(`
      [
        {
          "data": false,
          "queryKey": [
            "checkId",
            "bad",
          ],
        },
        {
          "data": true,
          "queryKey": [
            "checkId",
            "good",
          ],
        },
      ]
    `);

    expect(
      await queryClient.fetchQuery(fnRecordQuery.getCounter.queryOptions())
    ).toMatchInlineSnapshot("0");

    expect(
      await executeMutation(queryClient, {
        ...fnRecordQuery.updateCounter.mutationOptions(),
        variables: +1,
      })
    ).toMatchInlineSnapshot("1");

    expect(
      await queryClient.fetchQuery(fnRecordQuery.getCounter.queryOptions())
    ).toMatchInlineSnapshot("1");
  });
});

// https://github.com/TanStack/query/blob/9b48048a61bfc50483e4a7e16fa28ac23626896d/packages/query-core/src/tests/utils.ts#L57-L62
function executeMutation(
  queryClient: QueryClient,
  options: MutationOptions<any, any, any, any>
) {
  return queryClient.getMutationCache().build(queryClient, options).execute();
}
