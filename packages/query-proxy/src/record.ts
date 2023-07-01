import type { GetNextPageParamFunction } from "@tanstack/query-core";
import { createGetterProxy } from "./utils";

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

export type FnRecordQueryProxy<T extends FnRecord> = {
  [K in keyof T]: {
    queryKey: unknown[];
    queryOptions: (input: FnIn<T[K]>) => {
      queryKey: unknown[];
      queryFn: () => Promise<FnOut<T[K]>>;
    };
    infiniteQueryOptions: (
      input: FnIn<T[K]>,
      options: {
        getNextPageParam: GetNextPageParamFunction<FnOut<T[K]>>;
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

export function createFnRecordQueryProxy<T extends FnRecord>(
  fnRecord: T
): FnRecordQueryProxy<T> {
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
      if (prop === "infiniteQueryOptions") {
        return (input: unknown, options: any) => ({
          queryKey: [k, input],
          queryFn: ({ pageParam }: any) =>
            (fnRecord as any)[k](options.setPageParam(input, pageParam)),
          getNextPageParam: options.getNextPageParam,
        });
      }
      if (prop === "mutationOptions") {
        return () => ({
          mutationKey: [k],
          mutationFn: async (input: unknown) => (fnRecord as any)[k](input),
        });
      }
      throw new Error("invalid proxy usage", { cause: { k, prop } });
    })
  ) as any;
}
