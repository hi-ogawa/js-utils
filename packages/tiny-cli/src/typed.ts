import {
  difference,
  groupBy,
  pickBy,
  tinyassert,
  zipMax,
} from "@hiogawa/utils";
import { parseRawArgsToUntyped } from "./untyped";
import { DEFAULT_PROGRAM, ParseError, formatTable } from "./utils";

//
// ArgSchema
//

// `parse` and `description` is same as ZodType<T> so zod schema can be reused directly
// TODO: does it still work for most strict tsc config? (e.g. exactOptionalPropertyTypes)
export type ArgSchema<T> = {
  parse: (value?: unknown) => T;
  // either one of "position", "flag", "key-value" where "key-value" is assumed by default
  positional?: boolean;
  flag?: boolean;
  variadic?: true; // only for "positional: true"
  description?: string | undefined;
};

//
// defineCommand
//

export type ArgSchemaRecordBase = Record<string, ArgSchema<unknown>>;

export type TypedArgs<R extends ArgSchemaRecordBase> = {
  [K in keyof R]: R[K] extends ArgSchema<infer T> ? T : never;
};

export type Command = ReturnType<typeof defineCommand>;

export type HelpConfig = {
  program?: string;
  version?: string;
  description?: string;
  autoHelp?: boolean;
  autoHelpLog?: (v: string) => void; // for testing
};

export function defineCommand<ArgSchemaRecord extends ArgSchemaRecordBase>(
  config: {
    args: ArgSchemaRecord;
  } & HelpConfig,
  action: ({ args }: { args: TypedArgs<ArgSchemaRecord> }) => unknown
) {
  const entries = Object.entries(config.args);

  const schemaByType = {
    positionals: entries.filter((e) => e[1].positional),
    keyValues: entries.filter((e) => !e[1].flag && !e[1].positional),
    flags: entries.filter((e) => e[1].flag),
  };
  const schemaKeyValues = [...schemaByType.keyValues, ...schemaByType.flags];

  //
  // validate unsupported usage (which cannot be caught by typing)
  //

  // support only single "positional.variadic" for now
  const variadics = entries.filter((e) => e[1].variadic);
  if (variadics.some((e) => !e[1].positional)) {
    throw new Error("variadic supported only for 'positional'");
  }
  const variadic = variadics[0];
  if (variadic && schemaByType.positionals.length >= 2) {
    throw new Error(
      "variadic command with multiple positionals are unsupported"
    );
  }

  //
  // parse to TypedArgs
  //

  function parseOnly(rawArgs: string[]): TypedArgs<ArgSchemaRecord> {
    //
    // parse untyped
    //

    const untypedArgs = parseRawArgsToUntyped(rawArgs, {
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
      throw new ParseError(
        "duplicate options: " + dupKeys.map((k) => "--" + k).join(", ")
      );
    }

    // check unknown keys
    const unusedKeys = difference(
      untypedKeyValues.map((e) => e[0]),
      schemaKeyValues.map((e) => e[0])
    );
    if (unusedKeys.length > 0) {
      throw new ParseError(
        "unknown options: " + unusedKeys.map((k) => "--" + k).join(", ")
      );
    }

    // check unused positionals
    if (
      !variadic &&
      untypedArgs.positionals.length > schemaByType.positionals.length
    ) {
      throw new ParseError(
        "too many arguments: " + untypedArgs.positionals.join(", ")
      );
    }

    //
    // parse typed (TODO: accumulate errors?)
    //

    const typedArgs: Record<string, unknown> = {};

    if (variadic) {
      const [key, schema] = variadic;
      const value = untypedArgs.positionals;
      typedArgs[key] = ParseError.wrapFn(`failed to parse <${key}...>`, () =>
        schema.parse(value)
      );
    } else {
      for (const [e, value] of zipMax(
        schemaByType.positionals,
        untypedArgs.positionals
      )) {
        tinyassert(e);
        const [key, schema] = e;
        typedArgs[key] = ParseError.wrapFn(`failed to parse <${key}>`, () =>
          schema.parse(value)
        );
      }
    }

    const untypedKeyValuesMap = new Map(untypedKeyValues);
    for (const [key, schema] of new Map(schemaKeyValues)) {
      typedArgs[key] = ParseError.wrapFn(`failed to parse --${key}`, () =>
        schema.parse(untypedKeyValuesMap.get(key))
      );
    }

    return typedArgs as any;
  }

  //
  // parse and run action
  //

  function parse(rawArgs: string[]): unknown {
    // TODO: refactor this "interception" system? (e.g. throw it and handle in try/catch of user code?)
    // TODO: how to add these flags in help itself?
    // intercept --help and --version
    if (config.autoHelp && rawArgs[0] === "--help") {
      (config.autoHelpLog ?? console.log)(help());
      return;
    }
    if (config.version && rawArgs[0] === "--version") {
      (config.autoHelpLog ?? console.log)(config.version);
      return;
    }
    return action({ args: parseOnly(rawArgs) });
  }

  //
  // help
  //

  // program/version overriden by `defineSubCommands`
  function help(): string {
    const positionalsHelp = schemaByType.positionals.map((e) => [
      e[0],
      e[1].description ?? "",
    ]);

    const optionsHelp = schemaKeyValues.map((e) => [
      `--${e[0]}${e[1].flag ? "" : "=..."}`,
      e[1].description ?? "",
    ]);

    const usage = [
      config.program ?? DEFAULT_PROGRAM,
      optionsHelp.length > 0 && "[options]",
      ...schemaByType.positionals.map(
        (e) => `<${e[0]}${e[1].variadic ? "..." : ""}>`
      ),
    ].filter(Boolean);

    let result = `\
usage:
  $ ${usage.join(" ")}
`;

    if (config.description) {
      result += `
${config.description}
`;
    }

    if (positionalsHelp.length > 0) {
      result += `
positional arguments:
${formatTable(positionalsHelp)}
`;
    }

    if (optionsHelp.length > 0) {
      result += `
options:
${formatTable(optionsHelp)}
`;
    }
    return result;
  }

  return {
    config, // expose so that `defineSubCommands` can use `config.describe` etc...
    help,
    parse,
  };
}
