import { describe, expect, it } from "vitest";
import { parseStream, stringifyStream } from "./stream";

describe("stream", () => {
  it("basic", async () => {
    const stream = stringifyStream([
      Promise.resolve(0),
      { hello: Promise.reject("foo") },
    ]);
    const [data, done] = await parseStream(stream);
    expect(data).toMatchInlineSnapshot(`
      [
        Promise {},
        {
          "hello": Promise {},
        },
      ]
    `);
    await expect((data as any)[0]).resolves.toMatchInlineSnapshot(`0`);
    await expect((data as any)[1].hello).rejects.toMatchInlineSnapshot(`"foo"`);
    await done;
  });
});
