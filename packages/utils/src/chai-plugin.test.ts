import chai from "chai";
import { describe, expect, it } from "vitest";

// synchronous version of `rejects` helper
//   https://github.com/vitest-dev/vitest/blob/08021673df80958552f4c3717ef03fd11f46aee5/packages/expect/src/jest-expect.ts#L732

// references
//   https://www.chaijs.com/api/plugins/#method_addproperty
//   https://www.chaijs.com/guide/plugins/
//   https://vitest.dev/guide/extending-matchers.html

declare module "vitest" {
  interface Assertion<T = any> {
    thrownValue: Assertion<T>;
  }
}

chai.use((chai, utils) => {
  utils.addProperty(
    chai.Assertion.prototype,
    "thrownValue",
    function __VITEST_REJECTS__(this: any) {
      const error = new Error("thrownValue");
      utils.flag(this, "error", error);
      const obj = utils.flag(this, "object");

      if (typeof obj !== "function")
        throw new TypeError(
          `You must provide a function to expect() when using .throws2, not '${typeof obj}'.`
        );

      const proxy: any = new Proxy(this, {
        get: (target, key, receiver) => {
          const result = Reflect.get(target, key, receiver);

          if (typeof result !== "function")
            return result instanceof chai.Assertion ? proxy : result;

          return (...args: any[]) => {
            let value: any;
            try {
              value = obj();
            } catch (err) {
              utils.flag(this, "object", err);
              return result.call(this, ...args);
            }
            const _error = new chai.AssertionError(
              `function returned "${utils.inspect(value)}" instead of throwing`,
              { showDiff: true, expected: new Error("throws"), actual: value }
            ) as any;
            _error.stack = (error.stack as string).replace(
              error.message,
              _error.message
            );
            throw _error;
          };
        },
      });

      return proxy;
    }
  );
});

//
// example usage
//

describe("thrownValue", () => {
  it("basic", () => {
    // this would be mostly same as builtin `toThrowErrorMatchingInlineSnapshot`
    expect(() => {
      throw new Error("hello");
    }).thrownValue.toMatchInlineSnapshot("[Error: hello]");

    expect(() => {
      throw new Error("hello");
    }).toThrowErrorMatchingInlineSnapshot('"hello"');

    // but this allows asserting other than "message"
    expect(() => {
      throw new Error("hello", { cause: "world" });
    }).thrownValue.toMatchObject({ cause: "world" });

    // also non Error instance
    expect(() => {
      throw { some: "object" };
    }).thrownValue.toMatchObject({ some: expect.stringContaining("j") });
  });

  it("expect to throw", () => {
    expect(() => {
      expect(() => "nothing is thrown").thrownValue.toBeDefined();
    }).toThrowErrorMatchingInlineSnapshot(
      '"function returned \\"\'nothing is thrown\'\\" instead of throwing"'
    );
  });
});
