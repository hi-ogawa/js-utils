//
// generate type-safe react-query options wrapper from a record of async functions
//

// TODO: manage peer dependency
// TODO: test with actual react-query runtime

type FnAny = (...args: any[]) => any;
type FnAnyToAsync<F extends FnAny> = (
  ...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

export type FnRecord = Record<string, FnAny>;
export type FnRecordToAsync<R extends FnRecord> = {
  [K in keyof R]: FnAnyToAsync<R[K]>;
};

type FnIn<F extends FnAny> = Parameters<F> extends [infer I] ? I : void;
type FnOut<F extends FnAny> = Awaited<ReturnType<F>>;

export type ReactQueryOptionsProxy<T extends FnRecord> = {
  [K in keyof T]: {
    queryKey: unknown[];
    queryOptions: (input: FnIn<T[K]>) => {
      queryKey: unknown[];
      queryFn: () => Promise<FnOut<T[K]>>;
    };
    infiniteQueryOptions: (
      input: FnIn<T[K]>,
      options: {
        // cf. https://github.com/TanStack/query/blob/9b48048a61bfc50483e4a7e16fa28ac23626896d/packages/query-core/src/types.ts#L42
        getNextPageParam: (
          lastPage: FnOut<T[K]>,
          allPages: FnOut<T[K]>
        ) => unknown;
        setPageParam: (input: FnIn<T[K]>, pageParam: unknown) => FnIn<T[K]>;
      }
    ) => {
      queryKey: unknown[];
      queryFn: (context: unknown) => Promise<FnOut<T[K]>>;
      getNextPageParam: any;
    };
    mutationKey: unknown[];
    mutationOptions: () => {
      mutationKey: unknown[];
      mutationFn: (input: FnIn<T[K]>) => Promise<FnOut<T[K]>>;
    };
  };
};

export function createReactQueryOptionsProxy<T extends FnRecord>(
  fnRecord: T
): ReactQueryOptionsProxy<T> {
  return createGetterProxy((k) =>
    createGetterProxy((prop) => {
      if (prop === "queryKey" || prop === "mutationKey") {
        return [k];
      }
      if (prop === "queryOptions") {
        return (input: unknown) => ({
          queryKey: [k, input],
          queryFn: async () => (fnRecord as any)[k](input),
        });
      }
      if (prop === "mutationOptions") {
        return () => ({
          mutationKey: [k],
          mutationFn: async (input: unknown) => (fnRecord as any)[k](input),
        });
      }
      throw new Error(
        `invalid proxy property: k = ${String(k)}, prop = ${String(prop)}`
      );
    })
  ) as any;
}

function createGetterProxy(
  propHandler: (prop: string | symbol) => unknown
): unknown {
  return new Proxy(
    {},
    {
      get(_target, prop, _receiver) {
        return propHandler(prop);
      },
    }
  );
}
