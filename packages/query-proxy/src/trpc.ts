import type { GetNextPageParamFunction } from "@tanstack/query-core";
import type {
  AnyRouter,
  inferRouterInputs,
  inferRouterOutputs,
} from "@trpc/server";
import { createGetterProxy } from "./utils";

export type TrpcClientQueryProxy<
  Router extends AnyRouter,
  I = inferRouterInputs<Router>,
  O = inferRouterOutputs<Router>,
> = {
  // TODO: infer procedureType to expose only query or mutation
  [K in keyof I & keyof O]: {
    queryKey: unknown[];
    queryOptions: (input: I[K]) => {
      queryKey: unknown[];
      queryFn: () => Promise<O[K]>;
    };
    infiniteQueryOptions: (
      input: I[K],
      options: {
        getNextPageParam: GetNextPageParamFunction<O[K]>;
        setPageParam: (input: I[K], pageParam: unknown) => I[K];
      }
    ) => {
      queryKey: unknown[];
      queryFn: (context: unknown) => Promise<O[K]>;
      getNextPageParam: any;
    };
    mutationKey: unknown[];
    mutationOptions: () => {
      mutationKey: unknown[];
      mutationFn: (input: I[K]) => Promise<O[K]>;
    };
  };
};

export function createTrpcClientQueryProxy<Router extends AnyRouter>(
  client: any
): TrpcClientQueryProxy<Router> {
  return createGetterProxy((k) =>
    createGetterProxy((prop) => {
      if (prop === "queryOptions") {
        return (input: unknown) => ({
          queryKey: [k, input],
          queryFn: () => (client as any)[k].query(input),
        });
      }
      if (prop === "infiniteQueryOptions") {
        return (input: unknown, options: any) => ({
          queryKey: [k, input],
          queryFn: ({ pageParam }: any) =>
            (client as any)[k].query(options.setPageParam(input, pageParam)),
          getNextPageParam: options.getNextPageParam,
        });
      }
      if (prop === "mutationOptions") {
        return () => ({
          mutationKey: [k],
          mutationFn: (input: unknown) => (client as any)[k].mutate(input),
        });
      }
      throw new Error("invalid proxy usage", { cause: { k, prop } });
    })
  ) as any;
}

// strip deprecated query/mutation/subscription api which is incompatible with `FnRecord`
export function trpcCallerFnRecordCompat<Caller>(
  caller: Caller
): Omit<Caller, "query" | "mutation" | "subscription"> {
  return caller as any;
}
