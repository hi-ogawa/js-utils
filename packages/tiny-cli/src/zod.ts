import type { z } from "zod";
import type { ArgSchema } from "./typed";

// helper to reuse zod schema by monkey-patching...

const ARG_META = Symbol("ARG_META");

// cf. https://github.com/anatine/zod-plugins/blob/547e9a89e14ca889367b80791e8cc15393cba458/packages/zod-openapi/src/lib/zod-extensions.ts#L11C1-L19C2
declare module "zod" {
  interface ZodSchema<
    Output = any,
    Def extends z.ZodTypeDef = z.ZodTypeDef,
    Input = Output
  > {
    [ARG_META]: Omit<ArgSchema<unknown>, "parse">;

    asArg<T extends ZodSchema<Output, Def, Input>>(
      this: T,
      argMeta: Omit<ArgSchema<unknown>, "parse">
    ): T;
  }
}

export function setupZodExtendArg(zod: typeof z) {
  zod.ZodSchema.prototype.asArg = function (this, argMeta) {
    this[ARG_META] = argMeta;
    return this;
  };
  return () => {
    delete (zod.ZodSchema.prototype as any).extendArg;
  };
}

export function zodArg<Schema extends z.ZodType>(
  schema: Schema
): ArgSchema<z.infer<Schema>> {
  return {
    parse: schema.parse,
    help: schema.description,
    ...schema[ARG_META],
  };
}

export function zodArgs<Schema extends z.SomeZodObject, T = z.infer<Schema>>(
  schema: Schema
): { [K in keyof T]: ArgSchema<T[K]> } {
  let result: any = {};
  for (const [k, v] of Object.entries(schema.shape)) {
    result[k] = zodArg(v);
  }
  return result;
}
