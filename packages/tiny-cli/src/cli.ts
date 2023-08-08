import {
  type ArgSchemaRecordBase,
  type TypedArgsAction,
  helpArgsSchema,
  parseTypedArgs,
  validateArgsSchema,
} from "./typed";
import { ParseError } from "./utils";

export class TinyCli {
  private commandMap = new Map<string, Command>();
  private matchedCommandName?: string;

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
    this.matchedCommandName = commandName;

    // intercept --help for command
    if (!this.config?.noDefaultOptions && subRawArgs[0] === "--help") {
      const log = this.config?.logOverride ?? console.log;
      log(helpArgsSchema(command.config.args));
      return;
    }

    // execute command
    const typedArgs = parseTypedArgs(command.config.args, subRawArgs);
    return command.action({ args: typedArgs });
  }

  help() {
    this.config;
    this.matchedCommandName;
    return "todo";
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
