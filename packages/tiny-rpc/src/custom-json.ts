//
// simplified version of https://github.com/brillout/json-serializer
//
// notable differences are
// - support custom type
// - builtins support only for `undefined` and `Date`
// - drop `undefined` property
//

// cf.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

export function createCustomJson(options?: {
  extensions?: Record<string, Extension<any>>;
}) {
  const replacer = createCustomJsonReplacer(options);
  const reviver = createCustomJsonReviver(options);
  return {
    stringify: (v: any, _ignoredReplacer?: null, space?: number) =>
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
    for (const [tag, tx] of Object.entries(transformers)) {
      if (tx.match(v)) {
        return `!${tag}:${tx.stringify(v as never)}`;
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
    if (typeof v === "string") {
      for (const [tag, tx] of Object.entries(transformers)) {
        if (v.startsWith(`!${tag}:`)) {
          return tx.parse(v.slice(tag.length + 2));
        }
      }
    }
    return v;
  };
}

type Extension<T> = {
  match: (v: unknown) => v is T;
  stringify: (v: T) => string;
  parse: (s: string) => T;
};

export function defineExtension<T>(v: Extension<T>): Extension<T> {
  return v;
}

const builtins = {
  undefined: defineExtension<undefined>({
    match: (v): v is undefined => v === void 0,
    stringify: () => "",
    parse: () => void 0,
  }),
  Date: defineExtension<Date>({
    match: (v): v is Date => v instanceof Date,
    stringify: (v) => v.toISOString(),
    parse: (s) => new Date(s),
  }),
  "": defineExtension<`!${string}`>({
    match: (v): v is `!${string}` => typeof v === "string" && v.startsWith("!"),
    stringify: (v) => v,
    parse: (v) => v as any,
  }),
};
