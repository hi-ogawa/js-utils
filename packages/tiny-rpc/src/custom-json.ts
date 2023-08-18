//
// inspired by https://github.com/brillout/json-serializer
//
// notable differences are
// - not "stringify" but "serialize" for human-readability of json with indentation
// - support custom type
// - drop `undefined` property
//

import { tinyassert } from "@hiogawa/utils";

// cf.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

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
      if (tx.match(v)) {
        return [`!${tag}`, tx.serialize(v as never)];
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

    if (Array.isArray(v) && v.length === 2) {
      for (const [tag, tx] of Object.entries(transformers)) {
        if (v[0].startsWith(`!${tag}`)) {
          return tx.deserialize(v[1]);
        }
      }
    }
    return v;
  };
}

type Extension<T> = {
  match: (v: unknown) => boolean;
  serialize: (v: T) => unknown; // `serialize` doesn't have to `stringify`
  deserialize: (v: unknown) => T;
};

export function defineExtension<T>(v: Extension<T>): Extension<T> {
  return v;
}

const builtins = {
  undefined: defineExtension<undefined>({
    match: (v) => v === void 0,
    serialize: () => 0,
    deserialize: () => void 0,
  }),
  Date: defineExtension<Date>({
    match: (v) => v instanceof Date,
    serialize: (v) => v.toISOString(),
    deserialize: (v) => {
      tinyassert(typeof v === "string");
      return new Date(v);
    },
  }),
};
