import { type Command, ParseError, formatTable } from "./typed";

// TODO
// - default sub command?

export function defineSubCommands(config: {
  describe?: string;
  commands: Record<string, Command>;
}) {
  function parseOnly(rawArgs: string[]) {
    const [name, ...args] = rawArgs;
    if (!name) {
      throw new ParseError("missing command");
    }
    const command = config.commands[name];
    if (!command) {
      throw new ParseError(`invalid command: '${name}'`);
    }
    // TODO: how to let sub command help include `name`?
    return { name, args, command };
  }

  function parse(rawArgs: string[]) {
    const { args, command } = parseOnly(rawArgs);
    return command.parse(args);
  }

  function help() {
    const commandsHelp = Object.entries(config.commands).map(([k, v]) => [
      k,
      v.config.describe ?? "",
    ]);

    let result = `\
usage:
  $ program <command> ...
`;

    if (config.describe) {
      result += `
${config.describe}
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
