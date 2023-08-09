import {
  type ArgSchemaRecordBase,
  type TypedArgsAction,
  helpArgsSchema,
  parseTypedArgs,
  validateArgsSchema,
} from "./typed";
import { DEFAULT_PROGRAM, ParseError, formatTable } from "./utils";

export class TinyCli {
  commandMap = new Map<string, TinyCliCommand<any>>();
  lastMatchedCommand?: TinyCliCommand<any>; // track last sub command for easier help after parse error

  constructor(
    private config: {
      program?: string;
      version?: string;
      description?: string;
      noDefaultOptions?: boolean;
      log?: (v: string) => void;
    } = {}
  ) {}

  get program() {
    return this.config?.program ?? DEFAULT_PROGRAM;
  }

  get log() {
    return this.config?.log ?? console.log;
  }

  defineCommand<R extends ArgSchemaRecordBase>(
    config: {
      name: string;
      description?: string;
      args: R;
    },
    action: TypedArgsAction<R>
  ) {
    const command = new TinyCliCommand(
      {
        // copy parent config
        parentProgram: this.program,
        version: this.config.version,
        noDefaultOptions: this.config.noDefaultOptions,
        log: this.config.log,
        // sub command config
        program: config.name,
        description: config.description,
        args: config.args,
      },
      action
    );
    this.commandMap.set(config.name, command);
  }

  parse(rawArgs: string[]) {
    // intercept --help and --version
    if (!this.config.noDefaultOptions) {
      if (rawArgs[0] === "--help") {
        this.log(this.help());
        return;
      }
      if (this.config.version && rawArgs[0] === "--version") {
        this.log(this.config.version);
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

    // execute command
    this.lastMatchedCommand = command;
    return command.parse(subRawArgs);
  }

  help(options?: { noLastMatched?: boolean }): string {
    // sub command help for last `parse` call
    if (!options?.noLastMatched && this.lastMatchedCommand) {
      return this.lastMatchedCommand.help();
    }

    const title = [this.program, this.config.version].filter(Boolean).join("/");

    const commandsHelp = Array.from(this.commandMap.entries(), ([k, v]) => [
      k,
      v.config.description ?? "",
    ]);

    let result = `\
${title}

Usage:
  $ ${this.program} <command>
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
    public config: {
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
    const programs = [
      this.config.parentProgram,
      this.config.program ?? DEFAULT_PROGRAM,
    ].filter(Boolean);

    const title = [programs[0], this.config.version].filter(Boolean).join("/");
    const help = helpArgsSchema({
      program: programs.join(" "),
      description: this.config.description,
      args: this.config.args,
    });
    return [title, help].join("\n\n");
  }
}
