import type { ArgSchema } from "./typed";

// not necessarily specific to zod (not even peer-dep) but name it in that way
export function zArg<T>(
  schema: {
    parse: (value?: unknown) => T;
    description?: string | undefined;
  },
  meta?: Omit<ArgSchema<unknown>, "parse">
): ArgSchema<T> {
  return {
    parse: schema.parse,
    description: schema.description,
    ...meta,
  };
}
