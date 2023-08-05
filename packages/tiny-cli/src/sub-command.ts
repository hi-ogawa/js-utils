import { type Command, ParseError, formatTable } from "./typed";

// TODO
// - default sub command?

export function defineSubCommands(commands: Record<string, Command>) {
  function parseOnly(rawArgs: string[]) {
    const [name, ...args] = rawArgs;
    if (!name) {
      throw new ParseError("missing command");
    }
    const command = commands[name];
    if (!command) {
      throw new ParseError(`invalid command: '${name}'`);
    }
    return { name, args, command };
  }

  function parse(rawArgs: string[]) {
    const { args, command } = parseOnly(rawArgs);
    return command.parse(args);
  }

  function help() {
    const commandsHelp = Object.entries(commands).map(([k, _v]) => [k]);

    return `\
usage:
  $ program <command> ...

commands:
${formatTable(commandsHelp)}
`;
  }

  return {
    parseOnly,
    parse,
    help,
  };
}
