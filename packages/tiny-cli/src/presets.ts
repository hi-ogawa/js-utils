import { tinyassert } from "@hiogawa/utils";
import type { ArgSchema } from "./typed";
import { ParseError } from "./utils";

//
// defined presets so that zod is not required for the most of common cases
//

// TODO: rename?
export const argPresets = {
  boolean: (description?: string): ArgSchema<boolean> => ({
    type: "flag",
    description,
    parse: (v) => Boolean(v), // z.coerce.boolean()
  }),

  string: <
    Optional extends true | undefined = undefined,
    Default extends string | undefined = undefined
  >(
    description?: string,
    config?: { positional?: boolean; optional?: Optional; default?: Default }
  ): ArgSchema<InferParse<string, Optional, Default>> => ({
    type: config?.positional ? "positional" : "key-value",
    description,
    parse: (v) => {
      if (typeof v === "undefined") {
        if (typeof config?.default !== "undefined") {
          return config.default;
        }
        if (config?.optional) {
          return undefined as any; // why any?
        }
        throw new ParseError("required 'string'");
      }
      return parser.string(v);
    },
  }),

  number: <
    Optional extends true | undefined = undefined,
    Default extends number | undefined = undefined
  >(
    description?: string,
    config?: { positional?: boolean; optional?: Optional; default?: Default }
  ): ArgSchema<InferParse<number, Optional, Default>> => ({
    type: config?.positional ? "positional" : "key-value",
    description,
    parse: (v) => {
      if (typeof v === "undefined") {
        if (typeof config?.default !== "undefined") {
          return config.default;
        }
        if (config?.optional) {
          return undefined as any;
        }
        throw new ParseError("required 'number'");
      }
      return parser.coerceNumber(v);
    },
  }),

  stringArray: (description?: string): ArgSchema<string[]> => ({
    type: "positional",
    variadic: true,
    parse: (v) => parser.array(v, parser.string),
    description,
  }),

  numberArray: (description?: string): ArgSchema<number[]> => ({
    type: "positional",
    variadic: true,
    parse: (v) => parser.array(v, parser.coerceNumber),
    description,
  }),
};

type InferParse<
  K,
  Optional extends true | undefined,
  Default extends K | undefined
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
