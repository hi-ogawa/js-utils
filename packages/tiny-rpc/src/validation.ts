import { tinyassert } from "@hiogawa/utils";
import { TinyRpcError } from "./core";

// validator agnostic function guard

export function validateFn<Schema>(schema: Schema) {
  return function decorate<Out>(
    fn: (input: InferIO<Schema>["o"]) => Out
  ): (inputRaw: InferIO<Schema>["i"]) => Out {
    return function wrapper(inputRaw) {
      const parser = getParser(schema);
      let input: InferIO<Schema>["o"];
      try {
        input = parser(inputRaw);
      } catch (e) {
        throw TinyRpcError.fromUnknown(e).setStatus(400);
      }
      return fn(input);
    };
  };
}

// cf.
// https://github.com/trpc/trpc/blob/96956e790e6862bcc6dcc4622edc8e48da0adbcb/packages/server/src/core/internals/getParseFn.ts#L5
// https://github.com/trpc/trpc/blob/96956e790e6862bcc6dcc4622edc8e48da0adbcb/packages/server/src/core/parser.ts#L46

type InferIO<Parser> = Parser extends { _input: infer I; _output: infer O }
  ? {
      i: I;
      o: O;
    }
  : {
      i: never;
      o: never;
    };

function getParser(schema: unknown): Function {
  tinyassert(schema && typeof schema === "object");

  if ("parse" in schema && typeof schema.parse === "function") {
    return schema.parse;
  }

  throw new TinyRpcError("unsupported schema", { cause: schema });
}
