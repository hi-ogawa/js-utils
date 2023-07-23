import { beforeAll, describe, expect, it } from "vitest";
import { wrapError } from "./result";
import { Singleton } from "./singleton";

beforeAll(() => {
  // pretty print class
  expect.addSnapshotSerializer({
    test(val) {
      return typeof val === "function" && val.toString().startsWith("class ");
    },
    serialize(val, _config, _indentation, _depth, _refs, _printer) {
      return `[class ${val.name}]`;
    },
  });
});

describe(Singleton, () => {
  it("basic", async () => {
    const singleton = new Singleton();
    const logs: any[] = [];

    class App {
      config = singleton.resolve(Config);
      database = singleton.resolve(Database);

      constructor() {
        logs.push("App.constructor");
      }

      async init() {
        logs.push("App.init");
      }

      async deinit() {
        logs.push("App.deinit");
      }

      async doSomething() {
        logs.push("App.doSomething");
      }
    }

    class Database {
      config = singleton.resolve(Config);

      constructor() {
        logs.push("Database.constructor");
      }

      async init() {
        logs.push("Database.init");
      }

      async deinit() {
        logs.push("Database.deinit");
      }
    }

    class Config {
      constructor() {
        logs.push("Config.constructor");
      }

      async init() {
        logs.push("Config.init");
      }
    }

    // resolve top module
    const app = singleton.resolve(App);

    // check internal
    expect(singleton.stack).toMatchInlineSnapshot("[]");
    expect(singleton.deps).toMatchInlineSnapshot(`
      [
        [
          [class App],
          [class Config],
        ],
        [
          [class App],
          [class Database],
        ],
        [
          [class Database],
          [class Config],
        ],
      ]
    `);
    expect(singleton.instances).toMatchInlineSnapshot(`
      Map {
        [class Config] => Config {},
        [class Database] => Database {
          "config": Config {},
        },
        [class App] => App {
          "config": Config {},
          "database": Database {
            "config": Config {},
          },
        },
      }
    `);
    expect(singleton.sortDeps()).toMatchInlineSnapshot(`
      [
        Config {},
        Database {
          "config": Config {},
        },
        App {
          "config": Config {},
          "database": Database {
            "config": Config {},
          },
        },
      ]
    `);
    expect(logs).toMatchInlineSnapshot(`
      [
        "Config.constructor",
        "Database.constructor",
        "App.constructor",
      ]
    `);

    // check init/deinit calls
    for (const mod of singleton.sortDeps()) {
      await (mod as any).init?.();
    }
    expect(logs).toMatchInlineSnapshot(`
      [
        "Config.constructor",
        "Database.constructor",
        "App.constructor",
        "Config.init",
        "Database.init",
        "App.init",
      ]
    `);

    app.doSomething();
    expect(logs).toMatchInlineSnapshot(`
      [
        "Config.constructor",
        "Database.constructor",
        "App.constructor",
        "Config.init",
        "Database.init",
        "App.init",
        "App.doSomething",
      ]
    `);

    for (const mod of singleton.sortDeps().reverse()) {
      await (mod as any).deinit?.();
    }
    expect(logs).toMatchInlineSnapshot(`
      [
        "Config.constructor",
        "Database.constructor",
        "App.constructor",
        "Config.init",
        "Database.init",
        "App.init",
        "App.doSomething",
        "App.deinit",
        "Database.deinit",
      ]
    `);
  });

  it("error-cyclic-deps", () => {
    const singleton = new Singleton();

    class X {
      y = singleton.resolve(Y);
    }

    class Y {
      z = singleton.resolve(Z);
    }

    class Z {
      x = singleton.resolve(X);
    }

    const result = wrapError(() => singleton.resolve(X));
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [Error: 'Singleton.resolve' detected cyclic dependency],
      }
    `);
    expect((result.value as any).cause).toMatchInlineSnapshot("[class X]");
  });

  it("mocking", () => {
    const singleton = new Singleton();
    const logs: unknown[] = [];

    class X {
      y = singleton.resolve(Y);
      z = singleton.resolve(Z);

      hey() {
        logs.push("x.hoy");
        this.y.hee();
        this.z.hoy();
      }
    }

    class Y {
      z = singleton.resolve(Z);

      hee() {
        logs.push("y.hoy");
        this.z.hoy();
      }
    }

    class Z {
      hoy() {
        logs.push("z.hoy");
      }
    }

    const zMock: Z = {
      hoy() {
        logs.push("zMock.hoy");
      },
    };

    singleton.instances.set(Z, zMock);

    const x = singleton.resolve(X);
    x.hey();

    expect(logs).toMatchInlineSnapshot(`
      [
        "x.hoy",
        "y.hoy",
        "zMock.hoy",
        "zMock.hoy",
      ]
    `);
  });
});
