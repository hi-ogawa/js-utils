// TODO
// - support custom replacer/revivor plugin

export function replaceReference(data: unknown) {
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
    if (Array.isArray(v) && v.length >= 2 && v[0] === "!") {
      v = ["!", ...v];
    }

    // TODO: custom replacer
    // v = replacer(v)

    if (v && typeof v === "object") {
      v = Array.isArray(v) ? [...v] : { ...v };
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

  function recurse(v: unknown) {
    // replace reference placeholder
    if (Array.isArray(v) && v.length === 2 && v[0] === "!") {
      return refs[v[1]];
    }

    // unescape custom encoding collision
    if (Array.isArray(v) && v.length >= 3 && v[0] === "!") {
      v = v.slice(1);
    }

    if (v && typeof v === "object") {
      v = Array.isArray(v) ? [...v] : { ...v };
      // need to keep ref before recurse to handle circular reference
      // TOOD: however this approach cannot work with custom reviver?
      refs.push(v);
      for (const [k, e] of Object.entries(v as any)) {
        (v as any)[k] = recurse(e);
      }
    }

    // TODO: custom reviver
    // v = replacer(v)

    return v;
  }

  return recurse(data);
}
