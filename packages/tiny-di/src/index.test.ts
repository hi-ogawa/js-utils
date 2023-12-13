import { wrapError } from "@hiogawa/utils";
import { beforeAll, describe, expect, it } from "vitest";
import { TinyDi } from ".";

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

describe(TinyDi, () => {
  it("basic", async () => {
    const tinyDi = new TinyDi();
    const logs: any[] = [];

    class App {
      config = tinyDi.resolve(Config);
      database = tinyDi.resolve(Database);

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
      config = tinyDi.resolve(Config);

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
    const app = tinyDi.resolve(App);

    // check internal
    expect(tinyDi.stack).toMatchInlineSnapshot("[]");
    expect(tinyDi.deps).toMatchInlineSnapshot(`
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
    expect(tinyDi.instances).toMatchInlineSnapshot(`
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
    expect(tinyDi.sortDeps()).toMatchInlineSnapshot(`
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
    for (const mod of tinyDi.sortDeps()) {
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

    for (const mod of tinyDi.sortDeps().reverse()) {
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
    const tinyDi = new TinyDi();

    class X {
      y = tinyDi.resolve(Y);
    }

    class Y {
      z = tinyDi.resolve(Z);
    }

    class Z {
      x = tinyDi.resolve(X);
    }

    const result = wrapError(() => tinyDi.resolve(X));
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": false,
        "value": [Error: 'TinyDi.resolve' detected cyclic dependency],
      }
    `);
    expect((result.value as any).cause).toMatchInlineSnapshot("[class X]");
  });

  it("mocking", () => {
    const tinyDi = new TinyDi();
    const logs: unknown[] = [];

    class X {
      y = tinyDi.resolve(Y);
      z = tinyDi.resolve(Z);

      hey() {
        logs.push("x.hoy");
        this.y.hee();
        this.z.hoy();
      }
    }

    class Y {
      z = tinyDi.resolve(Z);

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

    tinyDi.instances.set(Z, zMock);

    const x = tinyDi.resolve(X);
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
