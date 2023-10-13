import { ExtensionContext } from 'vscode'
import { ConfigGenerator } from '../config/config.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { Notifier, VsCodeNotifier } from '../utils/notifier.utils'
import { Command } from './command.registry'
import {
  CleanupDocxJsonCommand,
  DropdownCommand,
  GenerateDocxJsonCommand,
  GithubTokenCommand,
  GitlabTokenCommand,
} from './index'

export class CommandFactory {
  static configGenerator = new ConfigGenerator(new FileSystemManager())
  static notifier: Notifier = new VsCodeNotifier()
  static fileSystem = new FileSystemManager()

  static createCleanupDocxJsonCommand(): Command {
    return new CleanupDocxJsonCommand(this.configGenerator, '.docx.json', this.notifier)
  }

  static createGenerateDocxJsonCommand(): Command {
    return new GenerateDocxJsonCommand(this.configGenerator, '.docx.json', this.notifier)
  }

  static createDropdownCommand(): Command {
    return new DropdownCommand(this.fileSystem)
  }

  static createGithubTokenCommand(context: ExtensionContext): Command {
    return new GithubTokenCommand(context)
  }

  static createGitlabTokenCommand(context: ExtensionContext): Command {
    return new GitlabTokenCommand(context)
  }
}
