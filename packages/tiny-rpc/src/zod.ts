import { z } from "zod";

// define function with single argument validated by zod
export function zodFn<Schema extends z.ZodType>(schema: Schema) {
  return function decorate<Out>(
    fn: (input: z.output<Schema>) => Out
  ): (input: z.input<Schema>) => Out {
    return function wrapper(input) {
      return fn(schema.parse(input));
    };
  };
}
