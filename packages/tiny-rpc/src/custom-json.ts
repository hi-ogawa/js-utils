//
// inspired by https://github.com/brillout/json-serializer
//
// notable differences are
// - human-readability of json with indentation
// - support custom type
//
// cf.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
//

import { tinyassert } from "@hiogawa/utils";

export function createCustomJson(options?: {
  extensions?: Record<string, Extension<any>>;
}) {
  const replacer = createCustomJsonReplacer(options);
  const reviver = createCustomJsonReviver(options);
  return {
    stringify: (v: any, _nullReplacer?: null, space?: number) =>
      JSON.stringify(v, replacer, space),
    parse: (s: string) => JSON.parse(s, reviver),
  };
}

export function createCustomJsonReplacer(options?: {
  extensions?: Record<string, Extension<any>>;
}) {
  const transformers = { ...options?.extensions, ...builtins };

  return function (this: unknown, k: string, vToJson: unknown) {
    // vToJson === v.toJSON() when `toJSON` is defined (e.g. Date)
    const v = (this as any)[k];

    // escape collision
    if (
      Array.isArray(v) &&
      v.length >= 2 &&
      typeof v[0] === "string" &&
      v[0].startsWith("!")
    ) {
      return ["!", ...v];
    }

    for (const [tag, tx] of Object.entries(transformers)) {
      if (tx.is(v)) {
        return [`!${tag}`, tx.replacer(v as never)];
      }
    }
    return vToJson;
  };
}

export function createCustomJsonReviver(options?: {
  extensions?: Record<string, Extension<any>>;
}) {
  const transformers = { ...options?.extensions, ...builtins };

  return (_k: string, v: unknown) => {
    // unescape collision
    if (
      Array.isArray(v) &&
      v.length >= 3 &&
      typeof v[0] === "string" &&
      v[0] === "!"
    ) {
      return v.slice(1);
    }

    if (Array.isArray(v) && v.length === 2 && typeof v[0] === "string") {
      for (const [tag, tx] of Object.entries(transformers)) {
        if (v[0].startsWith(`!${tag}`)) {
          return tx.reviver(v[1]);
        }
      }
    }
    return v;
  };
}

type Extension<T> = {
  is: (v: unknown) => boolean;
  replacer: (v: T) => unknown;
  reviver: (v: unknown) => T;
};

export function defineExtension<T>(v: Extension<T>): Extension<T> {
  return v;
}

const builtins = {
  //
  // constants
  //
  undefined: defineExtension<undefined>({
    is: (v) => typeof v === "undefined",
    replacer: () => 0,
    reviver: () => undefined,
  }),
  Infinity: defineExtension<number>({
    is: (v) => v === Infinity,
    replacer: () => 0,
    reviver: () => Infinity,
  }),
  "-Infinity": defineExtension<number>({
    is: (v) => v === -Infinity,
    replacer: () => 0,
    reviver: () => -Infinity,
  }),
  NaN: defineExtension<number>({
    is: (v) => typeof v === "number" && isNaN(v),
    replacer: () => 0,
    reviver: () => NaN,
  }),

  //
  // extra types
  //
  Date: defineExtension<Date>({
    is: (v) => v instanceof Date,
    replacer: (v) => v.toISOString(),
    reviver: (v) => {
      tinyassert(typeof v === "string");
      return new Date(v);
    },
  }),
  BigInt: defineExtension<bigint>({
    is: (v) => typeof v === "bigint",
    replacer: (v) => v.toString(),
    reviver: (v) => {
      tinyassert(typeof v === "string");
      return BigInt(v);
    },
  }),
  RegExp: defineExtension<RegExp>({
    is: (v) => v instanceof RegExp,
    replacer: (v) => [v.source, v.flags],
    reviver: (v) => {
      tinyassert(
        Array.isArray(v) &&
          v.length === 2 &&
          v.every((s) => typeof s === "string")
      );
      const [source, flags] = v;
      return new RegExp(source, flags);
    },
  }),

  //
  // extra containers
  //
  Map: defineExtension<Map<unknown, unknown>>({
    is: (v) => v instanceof Map,
    replacer: (v) => Array.from(v),
    reviver: (v) => {
      tinyassert(Array.isArray(v));
      return new Map(v);
    },
  }),
  Set: defineExtension<Set<unknown>>({
    is: (v) => v instanceof Set,
    replacer: (v) => Array.from(v),
    reviver: (v) => {
      tinyassert(Array.isArray(v));
      return new Set(v);
    },
  }),
};
