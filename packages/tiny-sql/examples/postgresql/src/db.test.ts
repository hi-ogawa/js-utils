import { describe, expect, it } from "vitest";
import { sql } from "./db";

describe("db", () => {
  it("basic", async () => {
    const rows = await sql`select * from counter`;
    expect(rows).toMatchInlineSnapshot(`
      Result [
        {
          "id": 1,
          "value": 0,
        },
      ]
    `);
  });
});
