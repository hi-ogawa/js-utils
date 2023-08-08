import type { ArgSchemaRecordBase, TypedArgsAction } from "./typed";

export class TinyCli {
  commands: any;
  matchedCommand: any;

  constructor(
    private config?: {
      program?: string;
      version?: string;
      description?: string;
      noHelp?: boolean;
      defaultCommand?: string; // as config instead of defineDefaultCommand?
    }
  ) {}

  defineDefaultCommand<R extends ArgSchemaRecordBase>(
    schemaRecord: R,
    action: TypedArgsAction<R>
  ) {
    schemaRecord;
    action;
  }

  // TODO: sub command
  defineCommand<R extends ArgSchemaRecordBase>(
    name: string,
    schemaRecord: R,
    action: TypedArgsAction<R>
  ) {
    name;
    schemaRecord;
    action;
  }

  help() {
    this.config;
  }
}

const cli = new TinyCli();

cli.defineDefaultCommand({}, () => {});
