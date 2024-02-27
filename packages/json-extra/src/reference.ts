import { tinyassert } from "@hiogawa/utils";

export function replaceReference(data: unknown) {
  const refs = new Map<unknown, number>();

  // TODO: configurable
  const plugins: Record<string, Plugin<any>> = builtinPlugins;

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
      const p = plugins[tag];
      if (p.is(v)) {
        v = [`!${tag}`, p.replacer(v)];
        break;
      }
    }

    if (v && typeof v === "object") {
      v = shallowCopy(v);
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }
    return v;
  }

  return recurse(data);
}

export function reviveReference(data: unknown) {
  const refs: unknown[] = [];

  // TODO: configurable
  const plugins: Record<string, Plugin<any>> = builtinPlugins;

  function recurse(v: unknown) {
    // revive reference placeholder
    if (Array.isArray(v) && v.length === 2 && v[0] === "!") {
      return refs[v[1]];
    }

    let plugin: Plugin<any> | undefined;
    let ref: unknown | undefined;

    // TODO: refactor messy branches...

    // unescape custom encoding collision
    //   ["!xxx", ...] <== ["!", "!xxx", ....]
    if (Array.isArray(v) && v.length >= 3 && v[0] === "!") {
      v = v.slice(1);
      refs.push(v);
    } else if (
      // custom reviver to obtain ref before recurse
      Array.isArray(v) &&
      v.length === 2 &&
      typeof v[0] === "string" &&
      v[0][0] === "!"
    ) {
      const tag = v[0].slice(1);
      v = shallowCopy(v[1]);
      plugin = plugins[tag];
      tinyassert(plugin);
      ref = plugin.reviverRef();
      refs.push(ref);
      refs.push("__dummy"); // dummy ref to align with replaceReference's offset (TODO: probably should fix replaceReference side)
    } else if (v && typeof v === "object") {
      // track ref before recurse to handle circular references
      v = shallowCopy(v);
      refs.push(v);
    }

    if (v && typeof v === "object") {
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }

    // custom reviver after recurse
    if (plugin) {
      v = plugin.reviver(v, ref);
    }

    return v;
  }

  return recurse(data);
}

// shallow copy to avoid overwriting original input
function shallowCopy(v: unknown) {
  if (v && typeof v === "object") {
    return Array.isArray(v) ? [...v] : { ...v };
  }
  return v;
}

//
// plugin
//

type Plugin<T> = {
  is: (v: unknown) => boolean;
  replacer: (v: T) => unknown;
  reviver: (v: unknown, ref: T) => T;
  reviverRef: () => T;
};

// type helper
export function definePlugin<T>(v: Plugin<T>): Plugin<T> {
  return v;
}

function definePluginConstant<T>(c: T): Plugin<T> {
  return {
    is: (v) => Object.is(v, c),
    replacer: () => 0,
    reviver: () => c,
    reviverRef: () => c,
  };
}

export const builtinPlugins = {
  //
  // constants
  //
  undefined: definePluginConstant(undefined),
  Infinity: definePluginConstant(Infinity),
  "-Infinity": definePluginConstant(-Infinity),
  NaN: definePluginConstant(NaN),
  "-0": definePluginConstant(-0),

  //
  // non containers
  //
  Date: definePlugin<Date>({
    is: (v) => v instanceof Date,
    replacer: (v) => v.toISOString(),
    reviver: (v, ref) => {
      tinyassert(typeof v === "string");
      ref.setTime(new Date(v).getTime());
      return ref;
    },
    reviverRef: () => new Date(0),
  }),

  //
  // containers
  //
  Set: definePlugin<Set<unknown>>({
    is: (v) => v instanceof Set,
    replacer: (v) => Array.from(v),
    reviver: (v, ref) => {
      tinyassert(Array.isArray(v));
      for (const e of v) {
        ref.add(e);
      }
      return ref;
    },
    reviverRef: () => new Set(),
  }),
};
