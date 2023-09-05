import { createGetterProxy } from "./utils";

type FnAny = (() => any) | ((input: any) => any);
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
      // `context` is supposed to be `import("@tanstack/query-core").QueryFunctionContext`
      // but we don't exactly specify the type to avoid restricting tanstack query version.
      // Assuming the use case of infinite query is limited, having "unknown" here won't degrade DX so bad.
      inputFn: (context?: unknown) => FnIn<T[K]>,
    ) => {
      queryKey: unknown[];
      queryFn: (context: unknown) => Promise<FnOut<T[K]>>;
    };
    mutationKey: unknown[];
    mutationOptions: () => {
      mutationKey: unknown[];
      mutationFn: (input: FnIn<T[K]>) => Promise<FnOut<T[K]>>;
    };
  };
};

export function createFnRecordQueryProxy<T extends FnRecord>(
  fnRecord: T,
): FnRecordQueryProxy<T> {
  return createGetterProxy((k) =>
    createGetterProxy((prop) => {
      if (prop === "queryKey" || prop === "mutationKey") {
        return [k];
      }
      if (prop === "queryOptions") {
        return (input: unknown) => ({
          queryKey: [k, input], // TODO: maybe strip if `input = undefined`?
          queryFn: async () => (fnRecord as any)[k](input),
        });
      }
      if (prop === "infiniteQueryOptions") {
        return (inputFn: any) => ({
          queryKey: [k, inputFn()],
          queryFn: (context: any) => (fnRecord as any)[k](inputFn(context)),
        });
      }
      if (prop === "mutationOptions") {
        return () => ({
          mutationKey: [k],
          mutationFn: async (input: unknown) => (fnRecord as any)[k](input),
        });
      }
      throw new Error("invalid proxy usage", { cause: { k, prop } });
    }),
  ) as any;
}
