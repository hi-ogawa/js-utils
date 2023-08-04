import { z } from "zod";

// prototype with zod for starter
// eventually we should be able to rewrite with own schema system

export function example() {
  z.string().parse;
  const commandOptions = {
    infile: defineArg(z.string(), { positional: true }),
    fix: defineArg(z.coerce.boolean(), { flag: true }),
    git: defineArg(z.coerce.boolean()),
  };
  // defineArg(z.string().array(), { variadic: true });

  // createCommand(
  //   {
  //     files: z.string().array(),
  //     fix: argSchema<boolean>({
  //       optional: true,
  //       default: false,
  //     }),
  //   },
  //   async ({ args }) => {
  //     args satisfies {
  //       files: string[];
  //       fix: boolean;
  //     };
  //   }
  // );
}

//
// borrow zod's parser
//

type ArgSchema<Schema extends z.ZodType> = {
  schema: Schema; // TODO: how to automatically co
  // alias?: string[];
  describe?: string; // TODO: use zod.describe?
  positional?: boolean;
  // variadic?: boolean; // TODO: zod.array?
  flag?: boolean;
  // optional?: boolean; // TODO: use zod optional?
};

function defineArg<Schema extends z.ZodType>(
  schema: Schema,
  other?: Omit<ArgSchema<Schema>, "schema">
): ArgSchema<Schema> {
  return { schema, ...other };
}

// export function createCommand<ArgSchemaRecord extends ArgSchemaRecordBase>(
//   schemaRecord: ArgSchemaRecord,
//   action: ({ args }: { args: TypedParsedArgs<ArgSchemaRecord> }) => unknown
// ) {
//   return {
//     help: () => {},
//     parse: (untypedArgs: ParsedArgs) => {
//       // parsedArgs;
//       untypedArgs;
//       schemaRecord;
//     },
//     run: () => {
//       action;
//     },
//   };
// }
