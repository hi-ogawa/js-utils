import { z } from "zod";
import { RpcError } from "./core";

// define function with single argument validated by zod
export function zodFn<Schema extends z.ZodType>(schema: Schema) {
  return function decorate<Out>(
    fn: (input: z.output<Schema>) => Out
  ): (input: z.input<Schema>) => Out {
    return function wrapper(input) {
      const result = schema.safeParse(input);
      if (!result.success) {
        throw RpcError.fromUnknown(result.error).setStatus(400);
      }
      return fn(result.data);
    };
  };
}
