export interface Command {
  execute(): Promise<void>
}

export class CommandRegistry {
  public commands: { [key: string]: Command } = {}

  register(commandName: string, command: Command) {
    this.commands[commandName] = command
  }

  get(commandName: string): Command {
    return this.commands[commandName]
  }
}
