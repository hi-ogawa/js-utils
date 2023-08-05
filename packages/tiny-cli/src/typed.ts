import { difference, groupBy, pickBy, range, zip } from "@hiogawa/utils";
import { parseRawArgsToUntyped } from "./untyped";

//
// defineArg
//

// TODO: disjoint union?
type ArgSchema<T> = {
  // alias?: string[]; // TODO
  describe?: string;
  positional?: true;
  // variadic?: true; // TODO
  // optional?: true; // TODO not needed if `parse` can takes care of it?
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

//
// defineCommand
//

type ArgSchemaRecordBase = Record<string, ArgSchema<unknown>>;

type TypedArgs<R extends ArgSchemaRecordBase> = {
  [K in keyof R]: R[K] extends ArgSchema<infer T> ? T : never;
};

export function defineCommand<ArgSchemaRecord extends ArgSchemaRecordBase>(
  schemaRecord: ArgSchemaRecord,
  action: ({ args }: { args: TypedArgs<ArgSchemaRecord> }) => unknown
) {
  const entries = Object.entries(schemaRecord);

  const schemaByType = {
    positionals: entries.filter((e) => e[1].positional),
    keyValues: entries.filter((e) => !e[1].positional && !e[1].flag),
    flags: entries.filter((e) => e[1].flag),
  };
  const schemaKeyValues = [...schemaByType.keyValues, ...schemaByType.flags];

  function parse(rawArgs: string[]): TypedArgs<ArgSchemaRecord> {
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
    const positionalsHelp = schemaByType.positionals.map((e) => [
      e[0],
      e[1].describe ?? "",
    ]);

    const optionsHelp = schemaKeyValues.map((e) => [
      `--${e[0]}${e[1].flag ? "" : "=..."}`,
      e[1].describe ?? "",
    ]);

    const usage = [
      "program",
      optionsHelp.length > 0 && "[options]",
      ...schemaByType.positionals.map((e) => `<${e[0]}>`),
    ].filter(Boolean);

    let result = `\
usage:
  ${usage.join(" ")}
`;

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
    help,
    parse,
    parseAndRun,
  };
}

//
// help formatting
//

function formatTable(rows: string[][]) {
  return formatIndent(
    padColumns(rows).map((row) => row.join(" ".repeat(4)).trimEnd()),
    2
  );
}

function padColumns(rows: string[][]): string[][] {
  if (rows.length === 0) {
    return rows;
  }
  const ncol = Math.max(...rows.map((row) => row.length));
  const widths = range(ncol).map((c) =>
    Math.max(...rows.map((row) => row[c]?.length ?? 0))
  );
  const newRows = rows.map((row) =>
    row.map((v, i) => v.padEnd(widths[i], " "))
  );
  return newRows;
}

function formatIndent(ls: string[], n: number): string {
  return ls.map((v) => " ".repeat(n) + v).join("\n");
}
