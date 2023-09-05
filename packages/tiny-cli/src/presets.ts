import { tinyassert } from "@hiogawa/utils";
import type { ArgSchema } from "./typed";
import { TinyCliParseError } from "./utils";

//
// define basic presets so that zod is not required for common cases
//

// TODO: let users import by star to help tree shake? e.g.
// import * as arg from "tiny-cli/presets"

export const arg = {
  boolean: (description?: string): ArgSchema<boolean> => ({
    flag: true,
    description,
    parse: (v) => Boolean(v), // z.coerce.boolean()
  }),

  string: <
    Optional extends true | undefined = undefined,
    Default extends string | undefined = undefined,
  >(
    description?: string,
    config?: { positional?: boolean; optional?: Optional; default?: Default },
  ): ArgSchema<InferParse<string, Optional, Default>> => ({
    positional: config?.positional,
    description,
    parse: (v) => {
      if (typeof v === "undefined") {
        if (typeof config?.default !== "undefined") {
          return config.default;
        }
        if (config?.optional) {
          return undefined as any; // why any?
        }
        throw new TinyCliParseError("required 'string'");
      }
      return parser.string(v);
    },
  }),

  number: <
    Optional extends true | undefined = undefined,
    Default extends number | undefined = undefined,
  >(
    description?: string,
    config?: { positional?: boolean; optional?: Optional; default?: Default },
  ): ArgSchema<InferParse<number, Optional, Default>> => ({
    positional: config?.positional,
    description,
    parse: (v) => {
      if (typeof v === "undefined") {
        if (typeof config?.default !== "undefined") {
          return config.default;
        }
        if (config?.optional) {
          return undefined as any;
        }
        throw new TinyCliParseError("required 'number'");
      }
      return parser.coerceNumber(v);
    },
  }),

  stringArray: (description?: string): ArgSchema<string[]> => ({
    positional: true,
    variadic: true,
    parse: (v) => parser.array(v, parser.string),
    description,
  }),

  numberArray: (description?: string): ArgSchema<number[]> => ({
    positional: true,
    variadic: true,
    parse: (v) => parser.array(v, parser.coerceNumber),
    description,
  }),
};

type InferParse<
  K,
  Optional extends true | undefined,
  Default extends K | undefined,
> = Optional extends true
  ? Default extends K
    ? K
    : K | undefined
  : Default extends K
  ? K // { default: "some-value" } implies { optional: true }
  : K;

const parser = {
  string: (v: unknown) => {
    tinyassert(typeof v === "string");
    return v;
  },

  coerceNumber: (v: unknown) => {
    const n = Number(v);
    tinyassert(!Number.isNaN(n));
    return n;
  },

  array: <T>(v: unknown, forEachFn: (e: unknown) => T): T[] => {
    tinyassert(Array.isArray(v));
    return v.map((e) => forEachFn(e));
  },
};
