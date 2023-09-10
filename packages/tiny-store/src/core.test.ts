import { describe, expect, it, vi } from "vitest";
import { createSimpleStore, storeSelect, storeTransform } from "./core";

describe(createSimpleStore, () => {
  it("basic", () => {
    const store = createSimpleStore(0);
    const onStoreChangeFn = vi.fn();
    const unsubscribe = store.subscribe(onStoreChangeFn);

    expect(store.get()).toMatchInlineSnapshot("0");
    expect(onStoreChangeFn.mock.calls.length).toMatchInlineSnapshot("0");

    store.set(1);
    expect(store.get()).toMatchInlineSnapshot("1");
    expect(onStoreChangeFn.mock.calls.length).toMatchInlineSnapshot("1");

    unsubscribe();
    store.set((x) => x + 1);
    expect(store.get()).toMatchInlineSnapshot("2");
    expect(onStoreChangeFn.mock.calls.length).toMatchInlineSnapshot("1");
  });
});

describe(storeTransform, () => {
  it("basic", () => {
    const store1 = createSimpleStore("0");
    const store2 = storeTransform<string, number>(
      store1,
      JSON.parse,
      JSON.stringify
    );

    const onStoreChangeFn1 = vi.fn();
    const unsubscribe1 = store1.subscribe(onStoreChangeFn1);
    const onStoreChangeFn2 = vi.fn();
    const unsubscribe2 = store2.subscribe(onStoreChangeFn2);

    expect(store1.get()).toMatchInlineSnapshot('"0"');
    expect(store2.get()).toMatchInlineSnapshot("0");
    expect(onStoreChangeFn1.mock.calls.length).toMatchInlineSnapshot("0");
    expect(onStoreChangeFn2.mock.calls.length).toMatchInlineSnapshot("0");

    store2.set(1);
    expect(store1.get()).toMatchInlineSnapshot('"1"');
    expect(store2.get()).toMatchInlineSnapshot("1");
    expect(onStoreChangeFn1.mock.calls.length).toMatchInlineSnapshot("1");
    expect(onStoreChangeFn2.mock.calls.length).toMatchInlineSnapshot("1");

    store1.set("2");
    expect(store1.get()).toMatchInlineSnapshot('"2"');
    expect(store2.get()).toMatchInlineSnapshot("2");
    expect(onStoreChangeFn1.mock.calls.length).toMatchInlineSnapshot("2");
    expect(onStoreChangeFn2.mock.calls.length).toMatchInlineSnapshot("2");

    unsubscribe2();
    store2.set((x) => x + 1);
    expect(store1.get()).toMatchInlineSnapshot('"3"');
    expect(store2.get()).toMatchInlineSnapshot("3");
    expect(onStoreChangeFn1.mock.calls.length).toMatchInlineSnapshot("3");
    expect(onStoreChangeFn2.mock.calls.length).toMatchInlineSnapshot("2");

    unsubscribe1();
    store1.set((x) => x.repeat(2));
    expect(store1.get()).toMatchInlineSnapshot('"33"');
    expect(store2.get()).toMatchInlineSnapshot("33");
    expect(onStoreChangeFn1.mock.calls.length).toMatchInlineSnapshot("3");
    expect(onStoreChangeFn2.mock.calls.length).toMatchInlineSnapshot("2");
  });

  it("memoized", () => {
    const store = storeTransform<string, { x: number }>(
      createSimpleStore(JSON.stringify({ x: 0 })),
      JSON.parse,
      JSON.stringify
    );

    const res = [store.get()];
    expect(res[0]).toMatchInlineSnapshot(`
      {
        "x": 0,
      }
    `);
    res.push(store.get());
    expect(res[0]).toEqual(res.at(-1));
    expect(res[0]).toBe(res.at(-1));

    store.set({ x: 0 }); // TODO: next `get` won't return new instance due to `decodeMemo`, which might be unintuitive
    res.push(store.get());
    expect(res[0]).toEqual(res.at(-1));
    expect(res[0]).toBe(res.at(-1));

    store.set({ x: 1 });
    res.push(store.get());
    expect(res.at(-1)).toMatchInlineSnapshot(`
      {
        "x": 1,
      }
    `);
    expect(res.at(-1)).toBe(store.get());
  });
});

describe(storeSelect, () => {
  it("basic", () => {
    const store1 = createSimpleStore({
      name: {
        first: "Jane",
        last: "Doe",
      },
      birth: {
        year: 2000,
        month: 1,
        day: 1,
      },
    });
    const store2 = storeSelect(store1, (v) => v.name);
    store2.set satisfies null;

    const store3 = storeSelect(store2, (v) => v.first);
    store3.set satisfies null;

    const snapshots = [store2.get()];
    expect(snapshots.at(-1)).toMatchInlineSnapshot(`
      {
        "first": "Jane",
        "last": "Doe",
      }
    `);
    expect(store3.get()).toMatchInlineSnapshot('"Jane"');

    store1.set((v) => ({ ...v, birth: { ...v.birth, day: 2 } }));
    snapshots.push(store2.get());
    expect(snapshots.at(-1)).toMatchInlineSnapshot(`
      {
        "first": "Jane",
        "last": "Doe",
      }
    `);
    expect(snapshots[0]).toBe(snapshots.at(-1));
    expect(snapshots[0]).toEqual(snapshots.at(-1));

    store1.set((v) => ({ ...v, name: { ...v.name } }));
    snapshots.push(store2.get());
    expect(snapshots.at(-1)).toMatchInlineSnapshot(`
      {
        "first": "Jane",
        "last": "Doe",
      }
    `);
    expect(snapshots[0]).not.toBe(snapshots.at(-1));
    expect(snapshots[0]).toEqual(snapshots.at(-1));

    store1.set((v) => ({ ...v, name: { ...v.name, first: "John" } }));
    snapshots.push(store2.get());
    expect(snapshots.at(-1)).toMatchInlineSnapshot(`
      {
        "first": "John",
        "last": "Doe",
      }
    `);
    expect(store3.get()).toMatchInlineSnapshot('"John"');
    expect(snapshots[0]).not.toBe(snapshots.at(-1));
    expect(snapshots[0]).not.toEqual(snapshots.at(-1));
  });
});
