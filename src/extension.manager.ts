import { ExtensionContext, commands, workspace } from 'vscode'
import { ConfigGenerator } from './config/config.manager'
import { FileSystemManager } from './utils/fileSystem.utils'
import { CommandRegistry } from './commands/command.registry'
import { Notifier, VsCodeNotifier } from './utils/notifier.utils'
import { WorkspaceManager } from './utils/workspace.utils'
import { CommandFactory } from './commands/command.factory'

export class ExtensionManager {
  private commandRegistry: CommandRegistry
  private generator: ConfigGenerator
  private notifier: Notifier
  private context: ExtensionContext
  private fileSystem: FileSystemManager
  private workspaceFolder = WorkspaceManager.getWorkspaceFolder()

  constructor(context: ExtensionContext) {
    this.commandRegistry = new CommandRegistry()
    this.notifier = new VsCodeNotifier()
    this.fileSystem = new FileSystemManager(workspace.fs, `${this.workspaceFolder}/.gitignore`)
    this.generator = new ConfigGenerator(this.fileSystem)
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
      'docx.addGitlabToken',
      CommandFactory.createGitlabTokenCommand(this.context)
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
