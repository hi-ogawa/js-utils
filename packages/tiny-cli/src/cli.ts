import { tinyassert } from "@hiogawa/utils";
import {
  type ArgSchemaRecordBase,
  type TypedArgsAction,
  helpArgsSchema,
  parseTypedArgs,
  validateArgsSchema,
} from "./typed";
import {
  DEFAULT_PROGRAM,
  DEFAULT_VERSION,
  ParseError,
  formatTable,
} from "./utils";

function initConfig(config?: {
  program?: string;
  version?: string;
  description?: string;
  noDefaultOptions?: boolean;
  log?: (v: string) => void;
}) {
  return {
    ...config,
    program: config?.program ?? DEFAULT_PROGRAM,
    version: config?.version ?? DEFAULT_VERSION,
    log: config?.log ?? console.log,
  };
}

type Command = {
  config: {
    name: string;
    description?: string;
    args: ArgSchemaRecordBase;
  };
  action: TypedArgsAction<any>;
};

export class TinyCli {
  config: ReturnType<typeof initConfig>;
  commandMap = new Map<string, Command>();
  lastMatchedCommand?: Command; // track last sub command for the use of help after parse error

  constructor(_config?: Parameters<typeof initConfig>[0]) {
    this.config = initConfig(_config);
  }

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
    if (!this.config.noDefaultOptions) {
      if (rawArgs[0] === "--help") {
        this.config.log(this.help());
        return;
      }
      if (this.config.version && rawArgs[0] === "--version") {
        this.config.log(this.config.version);
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
    if (!this.config.noDefaultOptions && subRawArgs[0] === "--help") {
      this.config.log(this.subHelp(command));
      return;
    }

    // execute command
    const typedArgs = parseTypedArgs(command.config.args, subRawArgs);
    return command.action({ args: typedArgs });
  }

  subHelp(command: Command) {
    const program = [this.config.program, command.config.name].join(" ");
    return helpArgsSchema({
      program,
      description: command.config.description,
      args: command.config.args,
    });
  }

  help(options?: { noLastMatched?: boolean }): string {
    // sub command help for last `parse` call
    if (!options?.noLastMatched && this.lastMatchedCommand) {
      return this.subHelp(this.lastMatchedCommand);
    }

    const title = [this.config.program, this.config.version]
      .filter(Boolean)
      .join("/");

    const commandsHelp = Array.from(this.commandMap.entries(), ([k, v]) => [
      k,
      v.config.description ?? "",
    ]);

    let result = `\
${title}

Usage:
  $ ${this.config.program} <command>
`;

    if (this.config.description) {
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

export class TinyCliCommand<R extends ArgSchemaRecordBase> {
  constructor(
    private config: {
      program: string;
      parentProgram?: string; // for sub command help
      version?: string;
      description?: string;
      noDefaultOptions?: boolean;
      log?: (v: string) => void;
      args: R;
    },
    private action: TypedArgsAction<R>
  ) {
    validateArgsSchema(config.args);
  }

  parse(rawArgs: string[]) {
    // intercept --help and --version
    if (!this.config.noDefaultOptions) {
      const log = this.config.log ?? console.log;
      if (rawArgs[0] === "--help") {
        log(this.help());
        return;
      }
      if (this.config.version && rawArgs[0] === "--version") {
        log(this.config.version);
        return;
      }
    }

    // execute command
    const typedArgs = parseTypedArgs(this.config.args, rawArgs);
    return this.action({ args: typedArgs });
  }

  help(): string {
    const program =
      this.config.parentProgram ?? this.config.program ?? DEFAULT_PROGRAM;

    const programUsage = [
      this.config.parentProgram,
      this.config.program ?? DEFAULT_PROGRAM,
    ]
      .filter(Boolean)
      .join(" ");

    const title = [program, this.config.version].filter(Boolean).join("/");
    const help = helpArgsSchema({
      program: programUsage,
      description: this.config.description,
      args: this.config.args,
    });
    return [title, help].join("\n\n");
  }
}

//
// single command version
//

type CommandSingle = {
  config: {
    args: ArgSchemaRecordBase;
  };
  action: TypedArgsAction<any>;
};

export class TinyCliSingle {
  private config: ReturnType<typeof initConfig>;
  private _command?: CommandSingle;

  constructor(_config?: Parameters<typeof initConfig>[0]) {
    this.config = initConfig(_config);
  }

  private get command() {
    tinyassert(this._command, "forgot to define command?");
    return this._command;
  }

  defineCommand<R extends ArgSchemaRecordBase>(
    config: {
      args: R;
    },
    action: TypedArgsAction<R>
  ) {
    validateArgsSchema(config.args);
    this._command = { config: { ...config }, action };
  }

  parse(rawArgs: string[]) {
    // intercept --help and --version
    if (!this.config.noDefaultOptions) {
      if (rawArgs[0] === "--help") {
        this.config.log(this.help());
        return;
      }
      if (this.config.version && rawArgs[0] === "--version") {
        this.config.log(this.config.version);
        return;
      }
    }

    // execute command
    const typedArgs = parseTypedArgs(this.command.config.args, rawArgs);
    return this.command.action({ args: typedArgs });
  }

  help(): string {
    const title = [this.config.program, this.config.version]
      .filter(Boolean)
      .join("/");
    const help = helpArgsSchema({
      program: this.config.program,
      description: this.config.description,
      args: this.command.config.args,
    });
    return [title, help].join("\n\n");
  }
}
