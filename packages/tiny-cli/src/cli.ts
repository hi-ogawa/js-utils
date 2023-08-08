import {
  type ArgSchemaRecordBase,
  type TypedArgsAction,
  helpArgsSchema,
  parseTypedArgs,
  validateArgsSchema,
} from "./typed";
import { DEFAULT_PROGRAM, ParseError, formatTable } from "./utils";

export class TinyCli {
  private commandMap = new Map<string, Command>();
  private lastMatchedCommand?: Command; // track last sub command for the use of help after parse error

  constructor(
    private config?: {
      program?: string;
      version?: string;
      description?: string;
      noDefaultOptions?: boolean;
      logOverride?: (v: string) => void;
      // TODO: support default command
      // defaultCommand?: string;
    }
  ) {}

  // per-command description
  defineCommand<R extends ArgSchemaRecordBase>(
    config: {
      name: string;
      description?: string;
      args: R;
    },
    action: TypedArgsAction<R>
  ) {
    validateArgsSchema(config.args);
    this.commandMap.set(config.name, {
      config,
      action,
    });
  }

  parse(rawArgs: string[]) {
    // intercept --help and --version
    if (!this.config?.noDefaultOptions) {
      const log = this.config?.logOverride ?? console.log;
      if (rawArgs[0] === "--help") {
        log(this.help());
        return;
      }
      if (this.config?.version && rawArgs[0] === "--version") {
        log(this.config.version);
        return;
      }
    }

    // match command
    const [commandName, ...subRawArgs] = rawArgs;
    if (!commandName) {
      throw new ParseError("missing command");
    }
    const command = this.commandMap.get(commandName);
    if (!command) {
      throw new ParseError(`invalid command: '${commandName}'`);
    }
    this.lastMatchedCommand = command;

    // intercept --help
    if (!this.config?.noDefaultOptions && subRawArgs[0] === "--help") {
      (this.config?.logOverride ?? console.log)(this.subHelp(command));
      return;
    }

    // execute command
    const typedArgs = parseTypedArgs(command.config.args, subRawArgs);
    return command.action({ args: typedArgs });
  }

  subHelp(command: Command) {
    const program = [
      this.config?.program ?? DEFAULT_PROGRAM,
      command.config.name,
    ].join(" ");
    return helpArgsSchema({
      program,
      description: command.config.description,
      args: command.config.args,
    });
  }

  help(options?: { lastMatched?: boolean }): string {
    // return sub command help for last `parse` call
    if (options?.lastMatched && this.lastMatchedCommand) {
      return this.subHelp(this.lastMatchedCommand);
    }

    const commandsHelp = Array.from(this.commandMap.entries(), ([k, v]) => [
      k,
      v.config.description ?? "",
    ]);

    let result = `\
Usage:
  $ ${this.config?.program ?? DEFAULT_PROGRAM} <command>
`;

    if (this.config?.description) {
      result += `
${this.config.description}
`;
    }

    if (commandsHelp.length > 0) {
      result += `
Available commands:
${formatTable(commandsHelp)}
`;
    }
    return result;
  }
}

type Command = {
  config: {
    name: string;
    description?: string;
    args: ArgSchemaRecordBase;
  };
  action: TypedArgsAction<any>;
};
