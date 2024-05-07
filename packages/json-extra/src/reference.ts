import { objectPick, tinyassert } from "@hiogawa/utils";

interface JsonExtraConfig {
  builtins?: true | BuiltinPlugin[];
  plugins?: Record<string, Plugin<any>>;
  // TODO: ability to disable reference preservation?
  // reference?: boolean;
}

export function createJsonExtra(config: JsonExtraConfig = {}) {
  const plugins: Record<string, Plugin<any>> = {
    ...(config.builtins === true
      ? builtinPlugins
      : Array.isArray(config.builtins)
        ? objectPick(builtinPlugins, config.builtins)
        : {}),
    ...config.plugins,
  };

  return {
    // any <-> any
    serialize: (v: any): any => serialize(v, plugins),
    deserialize: (v: any): any => deserialize(v, plugins),
    // any <-> string
    stringify: (...args: Parameters<typeof JSON.stringify>) =>
      JSON.stringify(serialize(args[0], plugins), args[1], args[2]),
    parse: (...args: Parameters<typeof JSON.parse>) =>
      deserialize(JSON.parse(...args), plugins),
  };
}

function serialize(data: unknown, plugins: Record<string, Plugin<any>>) {
  const refs = new Map<unknown, number>();

  function recurse(v: unknown) {
    // return reference placeholder
    if (refs.has(v)) {
      return ["!", refs.get(v)];
    }

    // track reference
    if (v && typeof v === "object") {
      refs.set(v, refs.size);
    }

    // escape custom encoding collision
    //   ["!xxx", ...] ==> ["!", "!xxx", ....]
    if (
      Array.isArray(v) &&
      v.length >= 2 &&
      typeof v[0] === "string" &&
      v[0][0] === "!"
    ) {
      v = ["!", ...v];
    }

    // custom replacer
    for (const tag in plugins) {
      const plugin = plugins[tag];
      if (plugin.is(v)) {
        v = plugin.replace(v);
        if (plugin.type === "container" && v && typeof v === "object") {
          v = Array.isArray(v) ? [...v] : { ...v };
          for (const [k, e] of Object.entries(v as any)) {
            (v as any)[k] = recurse(e);
          }
        }
        return [`!${tag}`, v];
      }
    }

    if (v && typeof v === "object") {
      // shallow copy to avoid overwriting original input
      v = Array.isArray(v) ? [...v] : { ...v };
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }
    return v;
  }

  return recurse(data);
}

function deserialize(data: unknown, plugins: Record<string, Plugin<any>>) {
  const refs: unknown[] = [];

  function recurse(v: unknown) {
    // revive reference placeholder
    if (Array.isArray(v) && v.length === 2 && v[0] === "!") {
      return refs[v[1]];
    }

    // custom reviver
    // ["!<tag>", <inner>]
    if (
      Array.isArray(v) &&
      v.length === 2 &&
      typeof v[0] === "string" &&
      v[0][0] === "!"
    ) {
      const tag = v[0].slice(1);
      const plugin = plugins[tag];
      tinyassert(plugin);
      v = v[1];
      const ref = plugin.revive(v);
      if (ref && typeof ref === "object") {
        refs.push(ref);
      }
      if (plugin.type === "container" && v && typeof v === "object") {
        v = Array.isArray(v) ? [...v] : { ...v };
        for (const [k, e] of Object.entries(v as any)) {
          (v as any)[k] = recurse(e);
        }
        plugin.reviveContainer(v, ref);
      }
      return ref;
    }

    // unescape custom encoding collision
    //   ["!xxx", ...] <== ["!", "!xxx", ....]
    if (Array.isArray(v) && v.length >= 3 && v[0] === "!") {
      v = v.slice(1);
    }

    if (v && typeof v === "object") {
      v = Array.isArray(v) ? [...v] : { ...v };
      refs.push(v);
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }

    return v;
  }

  return recurse(data);
}

//
// plugin
//

type Plugin<T> =
  | {
      type: "simple";
      is: (v: unknown) => boolean;
      replace: (v: T) => unknown;
      revive: (v: unknown) => T;
    }
  | {
      type: "container";
      is: (v: unknown) => boolean;
      replace: (v: T) => unknown;
      // container needs to return "empty reference" before recursion then mutate itself later
      revive: () => T;
      reviveContainer: (v: unknown, ref: T) => void;
    };

// type helper
export function definePlugin<T>(v: Plugin<T>): Plugin<T> {
  return v;
}

function defineConstant<T>(c: T): Plugin<T> {
  return {
    type: "simple",
    is: (v) => Object.is(v, c),
    replace: () => 0,
    revive: () => c,
  };
}

type BuiltinPlugin = keyof typeof builtinPlugins;

const builtinPlugins = {
  //
  // constants
  //
  undefined: defineConstant(undefined),
  Infinity: defineConstant(Infinity),
  "-Infinity": defineConstant(-Infinity),
  NaN: defineConstant(NaN),
  "-0": defineConstant(-0),

  //
  // non containers
  //
  Date: definePlugin<Date>({
    type: "simple",
    is: (v) => v instanceof Date,
    replace: (v) => v.toISOString(),
    revive: (v) => {
      tinyassert(typeof v === "string");
      return new Date(v);
    },
  }),
  BigInt: definePlugin<bigint>({
    type: "simple",
    is: (v) => typeof v === "bigint",
    replace: (v) => v.toString(),
    revive: (v) => {
      tinyassert(typeof v === "string");
      return BigInt(v);
    },
  }),
  RegExp: definePlugin<RegExp>({
    type: "simple",
    is: (v) => v instanceof RegExp,
    replace: (v) => [v.source, v.flags],
    revive: (v) => {
      tinyassert(
        Array.isArray(v) &&
          v.length === 2 &&
          v.every((s) => typeof s === "string"),
      );
      const [source, flags] = v;
      return new RegExp(source, flags);
    },
  }),

  //
  // containers
  //
  Map: definePlugin<Map<unknown, unknown>>({
    type: "container",
    is: (v) => v instanceof Map,
    replace: (v) => Array.from(v),
    revive: () => new Map(),
    reviveContainer: (v, ref) => {
      tinyassert(Array.isArray(v));
      for (const e of v) {
        ref.set(e[0], e[1]);
      }
    },
  }),
  Set: definePlugin<Set<unknown>>({
    type: "container",
    is: (v) => v instanceof Set,
    replace: (v) => Array.from(v),
    revive: () => new Set(),
    reviveContainer: (v, ref) => {
      tinyassert(Array.isArray(v));
      for (const e of v) {
        ref.add(e);
      }
    },
  }),
};
