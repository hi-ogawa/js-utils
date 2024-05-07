import { sleep } from "@hiogawa/utils";
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

  it("string", async () => {
    const stream = stringifyStream([
      sleep(200).then(() => "a"),
      sleep(100).then(() => "b"),
      sleep(400).then(() => "c"),
      sleep(300).then(() => "d"),
    ]);
    let result = "";
    await stream.pipeTo(
      new WritableStream({
        write(chunk) {
          result += chunk;
        },
      }),
    );
    expect(result).toMatchInlineSnapshot(`
      "["!__promise__","!__promise__","!__promise__","!__promise__"]
      {"type":"resolve","i":1,"data":"b"}
      {"type":"resolve","i":0,"data":"a"}
      {"type":"resolve","i":3,"data":"d"}
      {"type":"resolve","i":2,"data":"c"}
      "
    `);
  });
});
