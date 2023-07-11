import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MigrationState, Migrator } from "./migrator";

describe(Migrator.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
              "executedAt": "1970-01-01T00:00:01.000Z",
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
          "executedAt": "1970-01-01T00:00:01.000Z",
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
          "executedAt": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
        {
          "executedAt": "1970-01-01T00:00:02.000Z",
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
          "executedAt": "1970-01-01T00:00:01.000Z",
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
          "executedAt": "1970-01-01T00:00:01.000Z",
          "name": "create-user",
        },
        {
          "executedAt": "1970-01-01T00:00:04.000Z",
          "name": "up-only",
        },
        {
          "executedAt": "1970-01-01T00:00:04.000Z",
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
  });
});
