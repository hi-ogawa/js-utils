import { difference, groupBy, pickBy, zip } from "@hiogawa/utils";
import { parseArgs } from "./utils";

// TODO: disjoint union?
type ArgSchema<T> = {
  // alias?: string[]; // TODO
  // describe?: string; // TODO
  positional?: true;
  // variadic?: true; // TODO
  // optional?: true; // TODO for help?
  flag?: true;
  parse: (token?: string) => T; // can use ZodType.parse directly
};

// tiny DX helper to define ArgSchema
export function defineArg<T>(
  parse: ArgSchema<T>["parse"],
  other?: Omit<ArgSchema<T>, "parse">
): ArgSchema<T> {
  return { parse, ...other };
}

type ArgSchemaRecordBase = Record<string, ArgSchema<unknown>>;

type TypedParsedArgs<R extends ArgSchemaRecordBase> = {
  [K in keyof R]: R[K] extends ArgSchema<infer T> ? T : never;
};

export function createCommand<ArgSchemaRecord extends ArgSchemaRecordBase>(
  schemaRecord: ArgSchemaRecord,
  action: ({ args }: { args: TypedParsedArgs<ArgSchemaRecord> }) => unknown
) {
  const entries = Object.entries(schemaRecord);

  const schemaByType = {
    positionals: entries.filter((e) => e[1].positional),
    keyValues: entries.filter((e) => !e[1].positional && !e[1].flag),
    flags: entries.filter((e) => e[1].flag),
  };
  const schemaKeyValues = [...schemaByType.keyValues, ...schemaByType.flags];
  schemaKeyValues.map((e) => e[0]);

  function parse(rawArgs: string[]): TypedParsedArgs<ArgSchemaRecord> {
    //
    // parse untyped
    //

    const untypedArgs = parseArgs(rawArgs, {
      flags: schemaByType.flags.map((e) => e[0]),
    });

    // treat `flags` as "true" value
    const untypedKeyValues = [
      ...untypedArgs.keyValues,
      ...untypedArgs.flags.map((e) => [e, "true"] as const),
    ];

    //
    // validation
    //

    const dupKeys = [
      ...pickBy(
        groupBy(untypedKeyValues, (k) => k[0]),
        (v) => v.length >= 2
      ).keys(),
    ];
    if (dupKeys.length > 0) {
      throw new Error("duplicate options: " + dupKeys.join(", "));
    }

    // check unknown keys
    const unusedKeys = difference(
      untypedKeyValues.map((e) => e[0]),
      schemaKeyValues.map((e) => e[0])
    );
    if (unusedKeys.length > 0) {
      throw new Error("unknown options: " + unusedKeys.join(", "));
    }

    // check unused positionals (TODO: support variadic)
    if (untypedArgs.positionals.length > schemaByType.positionals.length) {
      throw new Error(
        "too many arguments: " + untypedArgs.positionals.join(", ")
      );
    }

    //
    // parse typed (TODO: accumulate errors?)
    //

    const typedArgs: Record<string, unknown> = {};

    for (const [[key, schema], value] of zip(
      schemaByType.positionals,
      untypedArgs.positionals
    )) {
      typedArgs[key] = schema.parse(value);
    }

    const untypedKeyValuesMap = new Map(untypedKeyValues);
    for (const [key, schema] of new Map(schemaKeyValues)) {
      typedArgs[key] = schema.parse(untypedKeyValuesMap.get(key));
    }

    return typedArgs as any;
  }

  function parseAndRun(rawArgs: string[]): unknown {
    return action({ args: parse(rawArgs) });
  }

  function help(): string {
    const positionals = schemaByType.positionals.map((e) => `<${e[0]}>`);
    const options = schemaKeyValues.map(
      (e) => `--${e[0]}${e[1].flag ? "" : "=..."}`
    );

    let result = `\
Usage:
  PROGRAM ${options.length > 0 ? "[options]" : ""} ${positionals.join(" ")}
`;

    if (options.length > 0) {
      result += `\

Options
${options.map((s) => "  " + s).join("\n")}
`;
    }
    return result;
  }

  return {
    help,
    parse,
    parseAndRun,
  };
}

//
// TODO: multi command (aka sub command)
//

// export function createMultiCommand() {}

//
// builtin schema
//

// function argSchema<T>(extra?: ArgSchema<T>): ArgSchema<T> {
//   // TODO
//   extra;
//   return {};
// }

// function stringOption(): ArgSchema<string> {
//   return {};
// }

// function numberArg() {}

// function booleanArg() {}
