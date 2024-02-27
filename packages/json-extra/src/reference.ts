import { tinyassert } from "@hiogawa/utils";

// TODO: move to core.ts

export function createJsonExtra2() {}

export function replaceReference(
  data: unknown,
  plugins: Record<string, Plugin<any>> = builtinPlugins
) {
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
        v = [`!${tag}`, plugin.replace(v)];
        if (plugin.type !== "container") {
          return v;
        }
        break;
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

export function reviveReference(
  data: unknown,
  plugins: Record<string, Plugin<any>> = builtinPlugins
) {
  const refs: unknown[] = [];

  function recurse(v: unknown) {
    // revive reference placeholder
    if (Array.isArray(v) && v.length === 2 && v[0] === "!") {
      return refs[v[1]];
    }

    let ref: unknown | undefined;
    let reviveContainer: ((v: unknown, ref: unknown) => unknown) | undefined;

    if (
      // unescape custom encoding collision
      //   ["!xxx", ...] <== ["!", "!xxx", ....]
      Array.isArray(v) &&
      v.length >= 3 &&
      v[0] === "!"
    ) {
      v = v.slice(1);
    } else if (
      // custom reviver to obtain ref before recurse
      Array.isArray(v) &&
      v.length === 2 &&
      typeof v[0] === "string" &&
      v[0][0] === "!"
    ) {
      const tag = v[0].slice(1);
      v = v[1];
      const plugin = plugins[tag];
      tinyassert(plugin);
      ref = plugin.revive(v);
      if (ref && typeof ref === "object") {
        refs.push(ref);
      }
      if (plugin.type !== "container") {
        return ref;
      }
      reviveContainer = plugin.reviveContainer;
    }

    if (v && typeof v === "object") {
      v = Array.isArray(v) ? [...v] : { ...v };
      refs.push(v);
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }

    // revive container after recurse
    if (reviveContainer) {
      v = reviveContainer(v, ref);
    }

    return v;
  }

  return recurse(data);
}

//
// plugin (TODO: move to plugins.ts)
//

type Plugin<T> =
  | {
      type: "simple";
      is: (v: unknown) => boolean;
      replace: (v: T) => unknown;
      revive: (v: unknown) => T;
    }
  | {
      // container needs to return "empty reference" before recursion then mutate itself later
      type: "container";
      is: (v: unknown) => boolean;
      replace: (v: T) => unknown;
      revive: () => T;
      reviveContainer: (v: unknown, ref: T) => T;
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

export const builtinPlugins = {
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
          v.every((s) => typeof s === "string")
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
      return ref;
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
      return ref;
    },
  }),
};
