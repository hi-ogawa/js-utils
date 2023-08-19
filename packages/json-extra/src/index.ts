import { objectPick, tinyassert } from "@hiogawa/utils";

// references
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

interface Options {
  builtins: true | BuiltinExtension[];
  extensions?: Record<string, Extension<any>>;
}

export function createJsonExtra(options: Options) {
  const replacer = createReplacer(options);
  const reviver = createReviver(options);
  function stringify(v: any, _unused?: unknown, space?: number) {
    return JSON.stringify(v, replacer, space);
  }
  function parse(s: string) {
    return JSON.parse(s, reviver);
  }
  return { stringify, parse, replacer, reviver };
}

// by default we don't bother dropping `undefined` properties, but we still provide non-dropping version.
// cf. https://github.com/brillout/json-serializer/blob/133fc9b1f73c4e29a8374b8eb5efa461a72949cc/src/parse.ts#L6
export function jsonParseReviveUndefined(
  s: string,
  reviver: ReturnType<typeof createReviver>
) {
  function recurseReviver(v: unknown) {
    if (v && typeof v === "object") {
      for (const [k, vv] of Object.entries(v)) {
        (v as any)[k] = recurseReviver(vv);
      }
    }
    return reviver("", v);
  }
  return recurseReviver(JSON.parse(s));
}

function createReplacer(options: Options) {
  const extensions = getExtensions(options);

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

    for (const [tag, tx] of Object.entries(extensions)) {
      if (tx.is(v)) {
        return [`!${tag}`, tx.replacer(v as never)];
      }
    }
    return vToJson;
  };
}

function createReviver(options: Options) {
  const extensions = getExtensions(options);

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
      for (const [tag, tx] of Object.entries(extensions)) {
        if (v[0].startsWith(`!${tag}`)) {
          return tx.reviver(v[1]);
        }
      }
    }
    return v;
  };
}

function getExtensions(options: Options): Record<string, Extension<any>> {
  let selected: Record<string, Extension<any>> = {};
  if (options.builtins === true) {
    selected = builtins;
  } else {
    selected = objectPick(builtins, options.builtins);
  }
  return { ...selected, ...options.extensions };
}

//
// extension definition
//

type Extension<T> = {
  is: (v: unknown) => boolean;
  replacer: (v: T) => unknown;
  reviver: (v: unknown) => T;
};

// type check helper
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

//
// builtin extension
//

type BuiltinExtension = keyof typeof builtins;

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
