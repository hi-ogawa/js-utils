import { type Command, type HelpConfig } from "./typed";
import { DEFAULT_PROGRAM, ParseError, formatTable } from "./utils";

// TODO: refactor similar logic from `definedCommand`
// TODO: class based api?

export function defineSubCommands(
  config: {
    commands: Record<string, Command>;
  } & HelpConfig
) {
  const program = config.program ?? DEFAULT_PROGRAM;

  // persist matched command so that user code can manually show sub-command's help when ParseError
  let matchedCommand: Command | undefined;

  // override subcommands help
  // TODO: better api to avoid mutation?
  for (const [name, command] of Object.entries(config.commands)) {
    command.config.program = [program, name].join(" ");
    command.config.version = config.version;
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
    // intercept --help and --version
    if (config.autoHelp && rawArgs[0] === "--help") {
      (config.autoHelpLog ?? console.log)(help());
      return;
    }
    if (config.version && rawArgs[0] === "--version") {
      (config.autoHelpLog ?? console.log)(config.version);
      return;
    }
    const { args, command } = parseOnly(rawArgs);
    matchedCommand = command;
    return command.parse(args);
  }

  function help() {
    if (matchedCommand) {
      return matchedCommand.help();
    }
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
    help,
    parse,
  };
}
