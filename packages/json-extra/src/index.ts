import { objectPick, tinyassert } from "@hiogawa/utils";

// TODO: superseded by reference.ts

// references
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

interface Options {
  builtins: true | BuiltinExtension[];
  extensions?: Record<string, Extension<any>>;
}

export function createJsonExtra(options: Options) {
  const extensions = getExtensions(options);
  const replacer = createReplacer(extensions);
  const reviver = createReviver(extensions);

  // any <-> string
  function stringify(v: any, _unused?: unknown, space?: number) {
    return JSON.stringify(v, replacer, space);
  }
  function parse(s: string) {
    return JSON.parse(s, reviver);
  }

  // by applying reviver manually, we can avoid dropping `undefined` property.
  // cf. https://github.com/brillout/json-serializer/blob/133fc9b1f73c4e29a8374b8eb5efa461a72949cc/src/parse.ts#L6
  function _parse2(s: string): any {
    return deserialize(JSON.parse(s));
  }

  // any <-> any (frameworks usually accept/provide only already parsed json object e.g. loader data in remix)
  function serialize(v: any): any {
    return applyReplacer(v, replacer);
  }
  function deserialize(v: any): any {
    return applyReviver(v, reviver);
  }

  return {
    stringify,
    parse,
    _parse2,
    serialize,
    deserialize,
    replacer,
    reviver,
  };
}

function applyReplacer(data: unknown, replacer: Replacer) {
  function recurse(v: unknown) {
    const vToJson =
      v &&
      typeof v === "object" &&
      "toJSON" in v &&
      typeof v.toJSON === "function"
        ? v.toJSON()
        : v;
    v = replacer.apply([v], [0, vToJson]);
    if (v && typeof v === "object") {
      v = Array.isArray(v) ? [...v] : { ...v };
      // `Object.entries` to loop only "enumerable" properties to align with `JSON.stringify`.
      // Note that this also "__proto__" as well since, it guarantees `k === "__proto__"` is an enumerable property of `v`.
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }
    return v;
  }
  return recurse(data);
}

function applyReviver(data: unknown, reviver: Reviver) {
  function recurse(v: unknown) {
    if (v && typeof v === "object") {
      v = Array.isArray(v) ? [...v] : { ...v };
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }
    return reviver("", v);
  }
  return recurse(data);
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
// custom encoding/decoding via replacer/reviver
//

type Replacer = (this: unknown, k: keyof any, vToJson: unknown) => unknown;
type Reviver = (k: string, v: unknown) => unknown;

function createReplacer(extensions: Record<string, Extension<any>>): Replacer {
  return function (k, vToJson) {
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

function createReviver(extensions: Record<string, Extension<any>>): Reviver {
  return (_k, v) => {
    // unescape collision
    if (
      Array.isArray(v) &&
      v.length >= 3 &&
      typeof v[0] === "string" &&
      v[0] === "!"
    ) {
      return v.slice(1);
    }

    if (
      Array.isArray(v) &&
      v.length === 2 &&
      typeof v[0] === "string" &&
      v[0][0] === "!"
    ) {
      const tx = extensions[v[0].slice(1)];
      if (tx) {
        return tx.reviver(v[1]);
      }
    }
    return v;
  };
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

export * from "./stream";
