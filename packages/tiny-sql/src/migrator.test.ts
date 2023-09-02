import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MigrationState, Migrator } from "./migrator";

describe(Migrator, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    return () => {
      vi.useRealTimers();
    };
  });

  it("basic", async () => {
    // in memory migration table
    let table!: MigrationState[];
    let executed: unknown[] = [];

    const migrator = new Migrator({
      provider: async () => {
        return ["create-user", "up-only", "create-profile"].map((name) => ({
          name,
          up: "up:" + name,
          down: name !== "up-only" ? "down:" + name : undefined,
        }));
      },
      driver: {
        init: async () => {
          table = [];
        },
        select: async () => {
          return table;
        },
        insert: async (s) => {
          table.push(s);
        },
        delete: async (s) => {
          table = table.filter((s2) => s2.name !== s.name);
        },
        run: async (input) => {
          executed.push(input);
        },
      },
    });

    let time = 0;
    const nextTime = () => (time += 1000);

    vi.setSystemTime(nextTime());
    await migrator.init();
    expect(table).toMatchInlineSnapshot("[]");
    expect(await migrator.status()).toMatchInlineSnapshot(`
      {
        "completed": [],
        "map": Map {
          "create-user" => {
            "request": {
              "down": "down:create-user",
              "name": "create-user",
              "up": "up:create-user",
            },
            "state": undefined,
          },
          "up-only" => {
            "request": {
              "down": undefined,
              "name": "up-only",
              "up": "up:up-only",
            },
            "state": undefined,
          },
          "create-profile" => {
            "request": {
              "down": "down:create-profile",
              "name": "create-profile",
              "up": "up:create-profile",
            },
            "state": undefined,
          },
        },
        "pending": [
          {
            "down": "down:create-user",
            "name": "create-user",
            "up": "up:create-user",
          },
          {
            "down": undefined,
            "name": "up-only",
            "up": "up:up-only",
          },
          {
            "down": "down:create-profile",
            "name": "create-profile",
            "up": "up:create-profile",
          },
        ],
      }
    `);

    expect(await migrator.up()).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "direction": "up",
            "name": "create-user",
            "status": "success",
          },
        ],
      }
    `);
    expect(await migrator.status()).toMatchInlineSnapshot(`
      {
        "completed": [
          {
            "down": "down:create-user",
            "name": "create-user",
            "up": "up:create-user",
          },
        ],
        "map": Map {
          "create-user" => {
            "request": {
              "down": "down:create-user",
              "name": "create-user",
              "up": "up:create-user",
            },
            "state": {
              "executed_at": "1970-01-01T00:00:01.000Z",
              "name": "create-user",
            },
          },
          "up-only" => {
            "request": {
              "down": undefined,
              "name": "up-only",
              "up": "up:up-only",
            },
            "state": undefined,
          },
          "create-profile" => {
            "request": {
              "down": "down:create-profile",
              "name": "create-profile",
              "up": "up:create-profile",
            },
            "state": undefined,
          },
        },
        "pending": [
          {
            "down": undefined,
            "name": "up-only",
            "up": "up:up-only",
          },
          {
            "down": "down:create-profile",
            "name": "create-profile",
            "up": "up:create-profile",
          },
        ],
      }
    `);
    expect(table).toMatchInlineSnapshot(`
      [
        {
          "executed_at": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
      ]
    `);
    expect(executed).toMatchInlineSnapshot(`
      [
        "up:create-user",
      ]
    `);

    vi.setSystemTime(nextTime());
    expect(await migrator.up()).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "direction": "up",
            "name": "up-only",
            "status": "success",
          },
        ],
      }
    `);
    expect(table).toMatchInlineSnapshot(`
      [
        {
          "executed_at": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
        {
          "executed_at": "1970-01-01T00:00:02.000Z",
          "name": "up-only",
        },
      ]
    `);
    expect(executed).toMatchInlineSnapshot(`
      [
        "up:create-user",
        "up:up-only",
      ]
    `);

    vi.setSystemTime(nextTime());
    expect(await migrator.down()).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "direction": "down",
            "name": "up-only",
            "status": "success",
          },
        ],
      }
    `);
    expect(table).toMatchInlineSnapshot(`
      [
        {
          "executed_at": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
      ]
    `);
    expect(executed).toMatchInlineSnapshot(`
      [
        "up:create-user",
        "up:up-only",
      ]
    `);

    vi.setSystemTime(nextTime());
    expect(await migrator.latest()).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "direction": "up",
            "name": "up-only",
            "status": "success",
          },
          {
            "direction": "up",
            "name": "create-profile",
            "status": "success",
          },
        ],
      }
    `);
    expect(table).toMatchInlineSnapshot(`
      [
        {
          "executed_at": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
        {
          "executed_at": "1970-01-01T00:00:04.000Z",
          "name": "up-only",
        },
        {
          "executed_at": "1970-01-01T00:00:04.000Z",
          "name": "create-profile",
        },
      ]
    `);
    expect(executed).toMatchInlineSnapshot(`
      [
        "up:create-user",
        "up:up-only",
        "up:up-only",
        "up:create-profile",
      ]
    `);

    vi.setSystemTime(nextTime());
    expect(await migrator.down()).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "direction": "down",
            "name": "create-profile",
            "status": "success",
          },
        ],
      }
    `);
    expect(table).toMatchInlineSnapshot(`
      [
        {
          "executed_at": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
        {
          "executed_at": "1970-01-01T00:00:04.000Z",
          "name": "up-only",
        },
      ]
    `);
    expect(executed).toMatchInlineSnapshot(`
      [
        "up:create-user",
        "up:up-only",
        "up:up-only",
        "up:create-profile",
        "down:create-profile",
      ]
    `);
  });

  describe("warning", () => {
    it("missing-applied", async () => {
      let table!: MigrationState[];
      let executed: unknown[] = [];
      let migrations = ["m1", "m2"];
      let logs: string[] = [];

      const migrator = new Migrator({
        logger: (v) => logs.push(v),
        provider: async () => {
          return migrations.map((name) => ({
            name,
            up: "up:" + name,
            down: "down:" + name,
          }));
        },
        driver: {
          init: async () => {
            table = [];
          },
          select: async () => {
            return table;
          },
          insert: async (s) => {
            table.push(s);
          },
          delete: async (s) => {
            table = table.filter((s2) => s2.name !== s.name);
          },
          run: async (input) => {
            executed.push(input);
          },
        },
      });

      expect(await migrator.init()).toMatchInlineSnapshot("undefined");
      expect(await migrator.up()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "direction": "up",
              "name": "m1",
              "status": "success",
            },
          ],
        }
      `);

      // remove "m1"
      migrations = ["m2"];
      expect(logs).toMatchInlineSnapshot("[]");
      expect(await migrator.status()).toMatchInlineSnapshot(`
        {
          "completed": [],
          "map": Map {
            "m2" => {
              "request": {
                "down": "down:m2",
                "name": "m2",
                "up": "up:m2",
              },
              "state": undefined,
            },
          },
          "pending": [
            {
              "down": "down:m2",
              "name": "m2",
              "up": "up:m2",
            },
          ],
        }
      `);
      expect(logs).toMatchInlineSnapshot(`
        [
          "[warning:migrator] already applied migrations are not provided: m1",
        ]
      `);
    });

    it("unapplied-before-applied", async () => {
      let table!: MigrationState[];
      let executed: unknown[] = [];
      let migrations = ["m2"];
      let logs: string[] = [];

      const migrator = new Migrator({
        logger: (v) => logs.push(v),
        provider: async () => {
          return migrations.map((name) => ({
            name,
            up: "up:" + name,
            down: "down:" + name,
          }));
        },
        driver: {
          init: async () => {
            table = [];
          },
          select: async () => {
            return table;
          },
          insert: async (s) => {
            table.push(s);
          },
          delete: async (s) => {
            table = table.filter((s2) => s2.name !== s.name);
          },
          run: async (input) => {
            executed.push(input);
          },
        },
      });

      expect(await migrator.init()).toMatchInlineSnapshot("undefined");
      expect(await migrator.up()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "direction": "up",
              "name": "m2",
              "status": "success",
            },
          ],
        }
      `);

      // add "m1" before "m2"
      migrations = ["m1", "m2"];
      expect(logs).toMatchInlineSnapshot("[]");
      expect(await migrator.status()).toMatchInlineSnapshot(`
        {
          "completed": [
            {
              "down": "down:m2",
              "name": "m2",
              "up": "up:m2",
            },
          ],
          "map": Map {
            "m1" => {
              "request": {
                "down": "down:m1",
                "name": "m1",
                "up": "up:m1",
              },
              "state": undefined,
            },
            "m2" => {
              "request": {
                "down": "down:m2",
                "name": "m2",
                "up": "up:m2",
              },
              "state": {
                "executed_at": "1970-01-01T00:00:00.000Z",
                "name": "m2",
              },
            },
          },
          "pending": [
            {
              "down": "down:m1",
              "name": "m1",
              "up": "up:m1",
            },
          ],
        }
      `);
      expect(logs).toMatchInlineSnapshot(`
        [
          "[warning:migrator] you have unapplied migration 'm1' before applied migration 'm2'",
        ]
      `);

      expect(await migrator.up()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "direction": "up",
              "name": "m1",
              "status": "success",
            },
          ],
        }
      `);
      expect(await migrator.status()).toMatchInlineSnapshot(`
        {
          "completed": [
            {
              "down": "down:m1",
              "name": "m1",
              "up": "up:m1",
            },
            {
              "down": "down:m2",
              "name": "m2",
              "up": "up:m2",
            },
          ],
          "map": Map {
            "m1" => {
              "request": {
                "down": "down:m1",
                "name": "m1",
                "up": "up:m1",
              },
              "state": {
                "executed_at": "1970-01-01T00:00:00.000Z",
                "name": "m1",
              },
            },
            "m2" => {
              "request": {
                "down": "down:m2",
                "name": "m2",
                "up": "up:m2",
              },
              "state": {
                "executed_at": "1970-01-01T00:00:00.000Z",
                "name": "m2",
              },
            },
          },
          "pending": [],
        }
      `);

      expect(await migrator.down()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "direction": "down",
              "name": "m2",
              "status": "success",
            },
          ],
        }
      `);
      expect(await migrator.status()).toMatchInlineSnapshot(`
        {
          "completed": [
            {
              "down": "down:m1",
              "name": "m1",
              "up": "up:m1",
            },
          ],
          "map": Map {
            "m1" => {
              "request": {
                "down": "down:m1",
                "name": "m1",
                "up": "up:m1",
              },
              "state": {
                "executed_at": "1970-01-01T00:00:00.000Z",
                "name": "m1",
              },
            },
            "m2" => {
              "request": {
                "down": "down:m2",
                "name": "m2",
                "up": "up:m2",
              },
              "state": undefined,
            },
          },
          "pending": [
            {
              "down": "down:m2",
              "name": "m2",
              "up": "up:m2",
            },
          ],
        }
      `);
    });
  });
});
