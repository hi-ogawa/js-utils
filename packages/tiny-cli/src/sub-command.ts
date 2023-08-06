import {
  type Command,
  DEFAULT_PROGRAM,
  type HelpConfig,
  ParseError,
  formatTable,
} from "./typed";

// TODO: refactor similar logic from `definedCommand`

export function defineSubCommands(
  config: {
    commands: Record<string, Command>;
  } & HelpConfig
) {
  const program = config.program ?? DEFAULT_PROGRAM;

  // override subcommands help
  for (const [name, command] of Object.entries(config.commands)) {
    command.config.program = [program, name].join(" ");
    command.config.autoHelp = config.autoHelp;
    command.config.autoHelpLog = config.autoHelpLog;
  }

  function parseOnly(rawArgs: string[]) {
    const [name, ...args] = rawArgs;
    if (!name) {
      throw new ParseError("missing command");
    }
    const command = config.commands[name];
    if (!command) {
      throw new ParseError(`invalid command: '${name}'`);
    }
    return { name, args, command };
  }

  function parse(rawArgs: string[]) {
    // intercept -h and --help
    if (config.autoHelp && ["-h", "--help"].includes(rawArgs[0])) {
      (config.autoHelpLog ?? console.log)(help());
      return;
    }
    const { args, command } = parseOnly(rawArgs);
    return command.parse(args);
  }

  function help() {
    const commandsHelp = Object.entries(config.commands).map(([k, v]) => [
      k,
      v.config.description ?? "",
    ]);

    let result = `\
usage:
  $ ${program} <command>
`;

    if (config.description) {
      result += `
${config.description}
`;
    }

    if (commandsHelp.length > 0) {
      result += `
commands:
${formatTable(commandsHelp)}
`;
    }

    return result;
  }

  return {
    parseOnly,
    parse,
    help,
  };
}
