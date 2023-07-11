import { beforeAll, describe, expect, it } from "vitest";
import { finializeDb, initializeDb, sql } from "./db";

beforeAll(() => {
  initializeDb();
  return () => {
    finializeDb();
  };
});

describe("db", () => {
  it("basic", async () => {
    const all = await sql`select * from counter`.all();
    expect(all).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "value": 0,
        },
      ]
    `);
  });
});
