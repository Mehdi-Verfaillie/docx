import { ExtensionContext, commands } from 'vscode'
import { CommandRegistry } from './commands/command.registry'
import { CommandFactory } from './commands/command.factory'

export class ExtensionManager {
  private commandRegistry: CommandRegistry
  private context: ExtensionContext

  constructor(context: ExtensionContext) {
    this.commandRegistry = new CommandRegistry()
    this.context = context

    // Configure the commands
    this.configureCommands()
  }

  private configureCommands(): void {
    this.commandRegistry.register(
      'docx.generateDocxJson',
      CommandFactory.createGenerateDocxJsonCommand()
    )
    this.commandRegistry.register(
      'docx.cleanupDocxJson',
      CommandFactory.createCleanupDocxJsonCommand()
    )
    this.commandRegistry.register('docx.openDropdown', CommandFactory.createDropdownCommand())
    this.commandRegistry.register(
      'docx.addGithubToken',
      CommandFactory.createGithubTokenCommand(this.context)
    )
    this.commandRegistry.register(
      'docx.deleteGithubToken',
      CommandFactory.deleteGithubTokenCommand(this.context)
    )
    this.commandRegistry.register(
      'docx.addGitlabToken',
      CommandFactory.createGitlabTokenCommand(this.context)
    )
    this.commandRegistry.register(
      'docx.deleteGitlabToken',
      CommandFactory.deleteGitlabTokenCommand(this.context)
    )
  }

  public registerCommands(context: ExtensionContext): void {
    for (const commandName in this.commandRegistry.commands) {
      const disposable = commands.registerCommand(commandName, async () => {
        await this.commandRegistry.get(commandName).execute()
      })

      context.subscriptions.push(disposable)
    }
  }
}
