import type { ParsedArgs } from "./utils";

export function example() {
  createCommand(
    {
      files: argSchema<string[]>({
        positional: true,
        variadic: true,
      }),
      fix: argSchema<boolean>({
        optional: true,
        default: false,
      }),
    },
    async ({ args }) => {
      args satisfies {
        files: string[];
        fix: boolean;
      };
    }
  );
}

//
// command schema typing system
//

type ArgSchema<T> = {
  alias?: string[];
  describe?: string;
  positional?: boolean;
  variadic?: boolean;
  flag?: boolean;
  optional?: boolean;
  default?: T;
  parse?: (
    token?: string
  ) => { ok: true; value: T } | { ok: false; value: unknown };
};

type ArgSchemaRecordBase = Record<string, ArgSchema<unknown>>;

type TypedParsedArgs<R extends ArgSchemaRecordBase> = {
  [K in keyof R]: R[K] extends ArgSchema<infer T> ? T : never;
};

export function createCommand<ArgSchemaRecord extends ArgSchemaRecordBase>(
  schemaRecord: ArgSchemaRecord,
  action: ({ args }: { args: TypedParsedArgs<ArgSchemaRecord> }) => unknown
) {
  return {
    help: () => {},
    parse: (untypedArgs: ParsedArgs) => {
      // parsedArgs;
      untypedArgs;
      schemaRecord;
    },
    run: () => {
      action;
    },
  };
}

//
// multi command (aka sub command)
//

export function createMultiCommand() {}

//
// builtin schema
//

function argSchema<T>(extra?: ArgSchema<T>): ArgSchema<T> {
  // TODO
  extra;
  return {};
}

function stringOption(): ArgSchema<string> {
  return {};
}

function numberArg() {}

function booleanArg() {}
