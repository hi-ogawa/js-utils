import { difference, groupBy, pickBy, range, zip } from "@hiogawa/utils";
import { parseRawArgsToUntyped } from "./untyped";

//
// defineArg
//

type ArgSchema<T> = {
  type?: "positional" | "key-value" | "flag"; // default key-value
  variadic?: true; // only for "positional"
  describe?: string;
  parse: (value?: unknown) => T; // can use ZodType.parse directly
  // alias?: string[]; // TODO
};

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
    positionals: entries.filter((e) => e[1].type === "positional"),
    keyValues: entries.filter((e) => !e[1].type || e[1].type === "key-value"),
    flags: entries.filter((e) => e[1].type === "flag"),
  };
  const schemaKeyValues = [...schemaByType.keyValues, ...schemaByType.flags];

  //
  // validate unsupported usage (which cannot be caught by typing)
  //

  // support only single "positional.variadic" for now
  const variadics = entries.filter((e) => e[1].variadic);
  if (variadics.some((e) => e[1].type !== "positional")) {
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

    // check unused positionals (TODO: support variadic)
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
      for (const [[key, schema], value] of zip(
        schemaByType.positionals,
        untypedArgs.positionals
      )) {
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
  // parse and run action (unfortunately this seems standard cli library api in js)
  //

  function parse(rawArgs: string[]): unknown {
    return action({ args: parseOnly(rawArgs) });
  }

  //
  // help
  //

  function help(): string {
    const positionalsHelp = schemaByType.positionals.map((e) => [
      e[0],
      e[1].describe ?? "",
    ]);

    const optionsHelp = schemaKeyValues.map((e) => [
      `--${e[0]}${e[1].type === "flag" ? "" : "=..."}`,
      e[1].describe ?? "",
    ]);

    const usage = [
      "program",
      optionsHelp.length > 0 && "[options]",
      ...schemaByType.positionals.map(
        (e) => `<${e[0]}${e[1].variadic ? "..." : ""}>`
      ),
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
    parseOnly,
    parse,
  };
}

export class ParseError extends Error {
  static wrapFn<T>(message: string, f: () => T): T {
    try {
      return f();
    } catch (e) {
      throw new ParseError(message, { cause: e });
    }
  }
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
