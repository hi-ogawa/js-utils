import {
  difference,
  groupBy,
  pickBy,
  tinyassert,
  zipMax,
} from "@hiogawa/utils";
import { parseUntyped } from "./untyped";
import { DEFAULT_PROGRAM, TinyCliParseError, formatTable } from "./utils";

//
// parse UntypedArgs to TypedArgs based on Record<string, ArgSchema>
//

// `parse` and `description` is same as ZodType<T> so zod schema can be reused directly
export type ArgSchema<T> = {
  parse: (value?: unknown) => T;
  // either one of "position", "flag", "key-value" where "key-value" is assumed by default
  positional?: boolean;
  flag?: boolean;
  variadic?: true; // only for "positional: true"
  description?: string | undefined;
};

export type ArgSchemaRecordBase = Record<string, ArgSchema<unknown>>;

export type TypedArgs<R extends ArgSchemaRecordBase> = {
  [K in keyof R]: R[K] extends ArgSchema<infer T> ? T : never;
};

export type TypedArgsAction<R extends ArgSchemaRecordBase> = (v: {
  args: TypedArgs<R>;
}) => unknown;

// check unsupported usage (which is not caught by typing)
export function validateArgsSchema(argsSchema: ArgSchemaRecordBase) {
  const { entries, variadics, positionals } = normalizeArgsSchema(argsSchema);

  // either positional, flag, or key-value
  if (entries.some((e) => e[1].positional && e[1].flag)) {
    throw new Error(
      "argument must be either one of 'positional', 'flag', or 'key-value'"
    );
  }

  // support only single "positional + variadic" for starter
  if (variadics.some((e) => !e[1].positional)) {
    throw new Error("variadic must be 'positional'");
  }
  if (variadics.length > 0 && positionals.length > 1) {
    throw new Error(
      "variadic command with multiple positionals are unsupported"
    );
  }
}

export function normalizeArgsSchema(argsSchema: ArgSchemaRecordBase) {
  const entries = Object.entries(argsSchema);
  return {
    entries,
    variadics: entries.filter((e) => e[1].variadic),
    positionals: entries.filter((e) => e[1].positional),
    keyValues: entries.filter((e) => !e[1].flag && !e[1].positional),
    flags: entries.filter((e) => e[1].flag),
    keyValueFlags: entries.filter((e) => !e[1].positional),
  };
}

export function parseTypedArgs<R extends ArgSchemaRecordBase>(
  argsSchema: R,
  rawArgs: string[]
): TypedArgs<R> {
  // normalize structure for convenience
  const normalized = normalizeArgsSchema(argsSchema);

  // parse untyped
  const untypedArgs = parseUntyped(rawArgs, {
    flags: normalized.flags.map((e) => e[0]),
  });

  // normalize untypedArgs (treat `flags` as "true" value)
  const untypedKeyValueFlags = [
    ...untypedArgs.keyValues,
    ...untypedArgs.flags.map((e) => [e, "true"] as const),
  ];

  //
  // validation
  //

  // check duplicate
  const dupKeys = [
    ...pickBy(
      groupBy(untypedKeyValueFlags, (k) => k[0]),
      (v) => v.length >= 2
    ).keys(),
  ];
  if (dupKeys.length > 0) {
    throw new TinyCliParseError(
      "duplicate options: " + dupKeys.map((k) => "--" + k).join(", ")
    );
  }

  // check unknown keys
  const unusedKeys = difference(
    untypedKeyValueFlags.map((e) => e[0]),
    normalized.keyValueFlags.map((e) => e[0])
  );
  if (unusedKeys.length > 0) {
    throw new TinyCliParseError(
      "unknown options: " + unusedKeys.map((k) => "--" + k).join(", ")
    );
  }

  // check unused positionals
  if (
    normalized.variadics.length === 0 &&
    untypedArgs.positionals.length > normalized.positionals.length
  ) {
    throw new TinyCliParseError(
      "too many arguments: " + untypedArgs.positionals.join(", ")
    );
  }

  //
  // parse typed (TODO: accumulate errors?)
  //

  const typedArgs: Record<string, unknown> = {};

  if (normalized.variadics.length > 0) {
    const [key, schema] = normalized.variadics[0];
    const value = untypedArgs.positionals;
    typedArgs[key] = TinyCliParseError.wrapFn(
      `failed to parse <${key}...>`,
      () => schema.parse(value)
    );
  } else {
    for (const [e, value] of zipMax(
      normalized.positionals,
      untypedArgs.positionals
    )) {
      tinyassert(e, "unreachable");
      const [key, schema] = e;
      typedArgs[key] = TinyCliParseError.wrapFn(
        `failed to parse <${key}>`,
        () => schema.parse(value)
      );
    }
  }

  const untypedKeyValuesMap = new Map(untypedKeyValueFlags);
  for (const [key, schema] of new Map(normalized.keyValueFlags)) {
    typedArgs[key] = TinyCliParseError.wrapFn(`failed to parse --${key}`, () =>
      schema.parse(untypedKeyValuesMap.get(key))
    );
  }

  return typedArgs as any;
}

export function helpArgsSchema(config: {
  program?: string;
  description?: string;
  args: ArgSchemaRecordBase;
}): string {
  const normalized = normalizeArgsSchema(config.args);

  const positionalsHelp = normalized.positionals.map((e) => [
    e[0],
    e[1].description ?? "",
  ]);

  const optionsHelp = normalized.keyValueFlags.map((e) => [
    `--${e[0]}${e[1].flag ? "" : "=..."}`,
    e[1].description ?? "",
  ]);

  const usage = [
    config.program ?? DEFAULT_PROGRAM,
    optionsHelp.length > 0 && "[options]",
    ...normalized.positionals.map(
      (e) => `<${e[0]}${e[1].variadic ? "..." : ""}>`
    ),
  ].filter(Boolean);

  let result = `\
Usage:
  $ ${usage.join(" ")}
`;

  if (config.description) {
    result += `
${config.description}
`;
  }

  if (positionalsHelp.length > 0) {
    result += `
Positional arguments:
${formatTable(positionalsHelp)}
`;
  }

  if (optionsHelp.length > 0) {
    result += `
Options:
${formatTable(optionsHelp)}
`;
  }
  return result;
}
