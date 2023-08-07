import type { ArgSchemaRecordBase } from "./typed";

export class TinyCli {
  commands: any;
  matchedCommand: any;

  constructor(
    private config: {
      program?: string;
      version?: string;
      description?: string;
      noHelp?: boolean;
    }
  ) {
  }

  defineDefaultCommand() {}

  defineCommand<ArgSchemaRecord extends ArgSchemaRecordBase>(name: string) {
    name;
  }

  help() {
    this.config;
  }
}
