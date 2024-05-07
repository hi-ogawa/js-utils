import { range } from "@hiogawa/utils";
import {
  InfiniteQueryObserver,
  MutationObserver,
  QueryClient,
} from "@tanstack/query-core";
import { describe, expect, it } from "vitest";
import { type FnRecord, createFnRecordQueryProxy } from "./record";

describe(createFnRecordQueryProxy, () => {
  it("example", async () => {
    //
    // define "FnRecord service"
    //

    let counter = 0;
    const pageAll = range(12);

    const fnRecord = {
      checkId: (id: string) => id === "good",

      getCounter: () => counter,

      updateCounter: (delta: number) => {
        counter += delta;
        return counter;
      },

      getPage: ({ limit = 5, cursor }: { limit?: number; cursor?: number }) => {
        let results = pageAll.slice();
        if (typeof cursor !== "undefined") {
          results = results.slice(cursor + 1);
        }
        results = results.slice(0, limit);
        return {
          results,
          nextCursor: results.at(-1),
        };
      },
    } satisfies FnRecord;

    //
    // use Service via QueryClient
    //
    const fnRecordQuery = createFnRecordQueryProxy(fnRecord);
    const queryClient = new QueryClient();

    //
    // query
    //

    // type-check
    fnRecordQuery.checkId.queryOptions satisfies (id: string) => {
      queryKey: unknown[];
      queryFn: (id: string) => Promise<boolean>;
    };

    expect(
      await queryClient.fetchQuery(fnRecordQuery.checkId.queryOptions("bad")),
    ).toMatchInlineSnapshot("false");

    expect(
      await queryClient.fetchQuery(fnRecordQuery.checkId.queryOptions("good")),
    ).toMatchInlineSnapshot("true");

    expect(
      await queryClient.fetchQuery(fnRecordQuery.getCounter.queryOptions()),
    ).toMatchInlineSnapshot("0");

    //
    // infinite query
    //

    const infiniteQueryObserver = new InfiniteQueryObserver(queryClient, {
      ...fnRecordQuery.getPage.infiniteQueryOptions((context: any) => ({
        limit: 5,
        cursor: context?.pageParam,
      })),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    expect(
      (await infiniteQueryObserver.fetchNextPage()).data,
    ).toMatchInlineSnapshot(`
      {
        "pageParams": [
          undefined,
        ],
        "pages": [
          {
            "nextCursor": 4,
            "results": [
              0,
              1,
              2,
              3,
              4,
            ],
          },
        ],
      }
    `);

    expect(
      (await infiniteQueryObserver.fetchNextPage()).data,
    ).toMatchInlineSnapshot(`
      {
        "pageParams": [
          undefined,
          4,
        ],
        "pages": [
          {
            "nextCursor": 4,
            "results": [
              0,
              1,
              2,
              3,
              4,
            ],
          },
          {
            "nextCursor": 9,
            "results": [
              5,
              6,
              7,
              8,
              9,
            ],
          },
        ],
      }
    `);

    expect(
      (await infiniteQueryObserver.fetchNextPage()).data,
    ).toMatchInlineSnapshot(`
      {
        "pageParams": [
          undefined,
          4,
          9,
        ],
        "pages": [
          {
            "nextCursor": 4,
            "results": [
              0,
              1,
              2,
              3,
              4,
            ],
          },
          {
            "nextCursor": 9,
            "results": [
              5,
              6,
              7,
              8,
              9,
            ],
          },
          {
            "nextCursor": 11,
            "results": [
              10,
              11,
            ],
          },
        ],
      }
    `);

    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((e) => ({ queryKey: e.queryKey, data: e.state.data })),
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
        {
          "data": 0,
          "queryKey": [
            "getCounter",
            undefined,
          ],
        },
        {
          "data": {
            "pageParams": [
              undefined,
              4,
              9,
            ],
            "pages": [
              {
                "nextCursor": 4,
                "results": [
                  0,
                  1,
                  2,
                  3,
                  4,
                ],
              },
              {
                "nextCursor": 9,
                "results": [
                  5,
                  6,
                  7,
                  8,
                  9,
                ],
              },
              {
                "nextCursor": 11,
                "results": [
                  10,
                  11,
                ],
              },
            ],
          },
          "queryKey": [
            "getPage",
            {
              "cursor": undefined,
              "limit": 5,
            },
          ],
        },
      ]
    `);

    //
    // mutation
    //

    // type check
    fnRecordQuery.updateCounter.mutationOptions satisfies () => {
      mutationKey: unknown[];
      mutationFn: (delta: number) => Promise<number>;
    };

    const mutationObserver = new MutationObserver(
      queryClient,
      fnRecordQuery.updateCounter.mutationOptions(),
    );
    expect(await mutationObserver.mutate(1)).toMatchInlineSnapshot("1");

    expect(
      await queryClient.fetchQuery(fnRecordQuery.getCounter.queryOptions()),
    ).toMatchInlineSnapshot("1");
  });

  it("reject multi arguments", () => {
    () =>
      ({
        good1: () => 1 + 1,

        good2: ({ x, y }: { x: number; y: number }) => x + y,

        // @ts-expect-error
        bad: (x: number, y: number) => x + y,
      }) satisfies FnRecord;
  });
});
