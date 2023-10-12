import { ExtensionContext, commands } from 'vscode'
import { ConfigGenerator } from './config/config.manager'
import { FileSystemManager } from './utils/fileSystem.utils'
import {
  CleanupDocxJsonCommand,
  GenerateDocxJsonCommand,
  GithubTokenCommand,
  GitlabTokenCommand,
} from './commands'
import { CommandRegistry } from './commands/command.registry'
import { Notifier, VsCodeNotifier } from './utils/notifier.utils'

export class ExtensionManager {
  private commandRegistry: CommandRegistry
  private generator: ConfigGenerator
  private notifier: Notifier
  private context: ExtensionContext

  constructor(context: ExtensionContext) {
    this.commandRegistry = new CommandRegistry()
    this.notifier = new VsCodeNotifier()
    const fileSystem = new FileSystemManager()
    this.generator = new ConfigGenerator(fileSystem)
    this.context = context
    // Configure the commands
    this.configureCommands()
  }

  private configureCommands(): void {
    const CONFIG_FILE_PATH = '.docx.json'
    this.commandRegistry.register(
      'docx.generateDocxJson',
      new GenerateDocxJsonCommand(this.generator, CONFIG_FILE_PATH, this.notifier)
    )
    this.commandRegistry.register(
      'docx.cleanupDocxJson',
      new CleanupDocxJsonCommand(this.generator, CONFIG_FILE_PATH, this.notifier)
    )
    this.commandRegistry.register('docx.addGithubToken', new GithubTokenCommand(this.context))
    this.commandRegistry.register('docx.addGitlabToken', new GitlabTokenCommand(this.context))
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
