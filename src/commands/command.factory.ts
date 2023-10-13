import { ExtensionContext, workspace } from 'vscode'
import { ConfigGenerator } from '../config/config.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { Notifier, VsCodeNotifier } from '../utils/notifier.utils'
import { WorkspaceManager } from '../utils/workspace.utils'
import { Command } from './command.registry'
import {
  CleanupDocxJsonCommand,
  DropdownCommand,
  GenerateDocxJsonCommand,
  TokenAddGithubCommand,
  TokenAddGitlabCommand,
} from './index'

export class CommandFactory {
  static workspaceFolder = WorkspaceManager.getWorkspaceFolder()
  static fileSystem = new FileSystemManager(workspace.fs, `${this.workspaceFolder}/.gitignore`)
  static configGenerator = new ConfigGenerator(this.fileSystem)
  static notifier: Notifier = new VsCodeNotifier()

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
    return new TokenAddGithubCommand(context)
  }

  static deleteGithubTokenCommand(context: ExtensionContext): Command {
    return new TokenAddGitlabCommand(context)
  }

  static createGitlabTokenCommand(context: ExtensionContext): Command {
    return new TokenAddGitlabCommand(context)
  }

  static deleteGitlabTokenCommand(context: ExtensionContext): Command {
    return new TokenAddGitlabCommand(context)
  }
}
