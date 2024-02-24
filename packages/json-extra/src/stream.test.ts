import { describe, expect, it } from "vitest";
import { parseStream, stringifyStream } from "./stream";

describe("stream", () => {
  it("basic", async () => {
    const input = [Promise.resolve(0), { hello: Promise.reject("foo") }];
    const stream = stringifyStream(input);
    const output: any = await parseStream(stream);
    expect(output).toMatchInlineSnapshot(`
      [
        Promise {},
        {
          "hello": Promise {},
        },
      ]
    `);
    await expect(output[0]).resolves.toMatchInlineSnapshot(`0`);
    await expect(output[1].hello).rejects.toMatchInlineSnapshot(`"foo"`);
  });
});
