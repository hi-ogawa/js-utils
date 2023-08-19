import { tinyassert } from "@hiogawa/utils";

// references
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

export function createJsonExtra(options?: {
  extensions?: Record<string, Extension<any>>;
}) {
  const replacer = createJsonExtraReplacer(options);
  const reviver = createJsonExtraReviver(options);
  return {
    stringify: (v: any, _nullReplacer?: null, space?: number) =>
      JSON.stringify(v, replacer, space),
    parse: (s: string) => JSON.parse(s, reviver),
  };
}

export function createJsonExtraReplacer(options?: {
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

export function createJsonExtraReviver(options?: {
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

export function defineJsonExtraExtension<T>(v: Extension<T>): Extension<T> {
  return v;
}

function defineConstant<T>(c: T): Extension<T> {
  return {
    is: (v) => Object.is(v, c),
    replacer: () => 0,
    reviver: () => c,
  };
}

const builtins = {
  //
  // constants
  //
  undefined: defineConstant(undefined),
  Infinity: defineConstant(Infinity),
  "-Infinity": defineConstant(-Infinity),
  NaN: defineConstant(NaN),
  "-0": defineConstant(-0),

  //
  // extra types
  //
  Date: defineJsonExtraExtension<Date>({
    is: (v) => v instanceof Date,
    replacer: (v) => v.toISOString(),
    reviver: (v) => {
      tinyassert(typeof v === "string");
      return new Date(v);
    },
  }),
  BigInt: defineJsonExtraExtension<bigint>({
    is: (v) => typeof v === "bigint",
    replacer: (v) => v.toString(),
    reviver: (v) => {
      tinyassert(typeof v === "string");
      return BigInt(v);
    },
  }),
  RegExp: defineJsonExtraExtension<RegExp>({
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
  Map: defineJsonExtraExtension<Map<unknown, unknown>>({
    is: (v) => v instanceof Map,
    replacer: (v) => Array.from(v),
    reviver: (v) => {
      tinyassert(Array.isArray(v));
      return new Map(v);
    },
  }),
  Set: defineJsonExtraExtension<Set<unknown>>({
    is: (v) => v instanceof Set,
    replacer: (v) => Array.from(v),
    reviver: (v) => {
      tinyassert(Array.isArray(v));
      return new Set(v);
    },
  }),
};
