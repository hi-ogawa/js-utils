import { describe, expect, it } from "vitest";
import { flattenErrorCauses, formatError } from "./error";

function reduceStacktrace(s: string) {
  return s.replaceAll(/at .*/g, "at (reducted)");
}

describe(formatError, () => {
  it("basic", () => {
    const e1 = new Error("e1", { cause: "just-string" });
    const e2 = new Error("e2", { cause: e1 });

    expect(reduceStacktrace(formatError(e2))).toMatchInlineSnapshot(`
      "
      [41m ERROR [49m e2

      [36m    at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)


      [41m ERROR:CAUSE [49m e1

      [36m    at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)


      [41m ERROR:CAUSE:2 [49m just-string

      "
    `);

    expect(
      reduceStacktrace(formatError(e2, { noCause: true })),
    ).toMatchInlineSnapshot(`
      "
      [41m ERROR [49m e2

      [36m    at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
      "
    `);

    expect(
      reduceStacktrace(formatError(e2, { noColor: true })),
    ).toMatchInlineSnapshot(`
      "
      [ERROR] e2

          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)


      [ERROR:CAUSE] e1

          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)
          at (reducted)


      [ERROR:CAUSE:2] just-string

      "
    `);
  });
});

describe(flattenErrorCauses, () => {
  it("handle cyclic reference", () => {
    const e1 = new Error("e1");
    const e2 = new Error("e2", { cause: e1 });
    e1.cause = e2;
    expect(flattenErrorCauses(e1)).toMatchInlineSnapshot(`
      [
        [Error: e1],
        [Error: e2],
      ]
    `);
  });
});
