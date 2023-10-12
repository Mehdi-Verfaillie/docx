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
import { DropdownCommand } from './commands/dropdown.command'
import { Documentation } from './association.manager'

export class ExtensionManager {
  private commandRegistry: CommandRegistry
  private generator: ConfigGenerator
  private notifier: Notifier
  private context: ExtensionContext
  private fileSystem: FileSystemManager
  private documentations: Documentation[]
  private jsonConfig: string

  constructor(context: ExtensionContext, documentations: Documentation[], jsonConfig: string) {
    this.commandRegistry = new CommandRegistry()
    this.notifier = new VsCodeNotifier()
    this.fileSystem = new FileSystemManager()
    this.generator = new ConfigGenerator(this.fileSystem)
    this.context = context
    this.documentations = documentations
    this.jsonConfig = jsonConfig
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
    this.commandRegistry.register(
      'docx.openDropdown',
      new DropdownCommand(this.documentations, this.fileSystem, this.jsonConfig)
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
