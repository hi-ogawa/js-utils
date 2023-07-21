import { describe, expect, it } from "vitest";
import { wrapError } from "./result";
import { Singleton, type SingletonHooks } from "./singleton";

describe(Singleton, () => {
  it("basic", async () => {
    const singleton = new Singleton();
    const logs: any[] = [];

    class App implements SingletonHooks {
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
    }

    class Database implements SingletonHooks {
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

    class Config implements Pick<SingletonHooks, "init"> {
      constructor() {
        logs.push("Config.constructor");
      }

      async init() {
        logs.push("Config.init");
      }
    }

    prettyPrintClasses([App, Database, Config]);

    // resolve top module
    const app = singleton.resolve(App);
    app;

    // check internal
    expect(singleton.stack).toMatchInlineSnapshot("[]");
    expect(singleton.deps).toMatchInlineSnapshot(`
      [
        [
          "[class App]",
          "[class Config]",
        ],
        [
          "[class App]",
          "[class Database]",
        ],
        [
          "[class Database]",
          "[class Config]",
        ],
      ]
    `);
    expect(singleton.instances).toMatchInlineSnapshot(`
      Map {
        "[class Config]" => Config {},
        "[class Database]" => Database {
          "config": Config {},
        },
        "[class App]" => App {
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

    // check init/deinit calls
    expect(logs).toMatchInlineSnapshot(`
      [
        "Config.constructor",
        "Database.constructor",
        "App.constructor",
      ]
    `);

    await singleton.init();
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

    await singleton.deinit();
    expect(logs).toMatchInlineSnapshot(`
      [
        "Config.constructor",
        "Database.constructor",
        "App.constructor",
        "Config.init",
        "Database.init",
        "App.init",
        "Database.deinit",
        "App.deinit",
      ]
    `);
  });

  it("error-cyclic-deps", () => {
    const singleton = new Singleton();

    class X {
      config = singleton.resolve(Y);
    }

    class Y {
      config = singleton.resolve(Z);
    }

    class Z {
      config = singleton.resolve(X);
    }

    prettyPrintClasses([X, Y, Z]);

    const result = wrapError(() => singleton.resolve(X));
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [Error: 'Singleton.resolve' detected cyclic dependency],
      }
    `);
    expect((result.value as any).cause).toMatchInlineSnapshot('"[class X]"');
  });
});

function prettyPrintClasses(klasses: unknown[]) {
  expect.addSnapshotSerializer({
    test(val) {
      return klasses.includes(val);
    },
    serialize(val, config, indentation, depth, refs, printer) {
      return printer(`[class ${val.name}]`, config, indentation, depth, refs);
    },
  });
}
