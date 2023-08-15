import { z } from "zod";
import { TinyRpcError } from "./core";

// TODO: make validator agnostic like trpc
// https://github.com/trpc/trpc/blob/96956e790e6862bcc6dcc4622edc8e48da0adbcb/packages/server/src/core/internals/getParseFn.ts#L5
// https://github.com/trpc/trpc/blob/96956e790e6862bcc6dcc4622edc8e48da0adbcb/packages/server/src/core/parser.ts#L46

// define function with single argument validated by zod
export function zodFn<Schema extends z.ZodType>(schema: Schema) {
  return function decorate<Out>(
    fn: (input: z.output<Schema>) => Out
  ): (input: z.input<Schema>) => Out {
    return function wrapper(input) {
      const result = schema.safeParse(input);
      if (!result.success) {
        throw TinyRpcError.fromUnknown(result.error).setStatus(400);
      }
      return fn(result.data);
    };
  };
}
