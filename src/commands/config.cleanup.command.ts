// File: cleanupDocxJson.command.ts

import { ConfigGenerator } from '../config/config.manager'
import { Command } from './command.registry'
import { ErrorManager } from '../utils/error.utils'
import { WorkspaceManager } from '../utils/workspace.utils'
import { join } from 'path'
import { Notifier } from '../utils/notifier.utils'

export class CleanupDocxJsonCommand implements Command {
  private rootPath?: string = WorkspaceManager.getWorkspaceFolder()

  constructor(
    private configGenerator: ConfigGenerator,
    private configFilePath: string,
    private notifier: Notifier
  ) {}

  async execute() {
    if (!this.rootPath)
      return ErrorManager.outputError('Unable to find the rootPath of your project')

    const fullConfigFilePath = join(this.rootPath, this.configFilePath)
    try {
      await this.configGenerator.cleanupDocxJson(fullConfigFilePath)
      this.notifier.notifySuccess('.docx.json file cleaned up successfully!')
    } catch (error) {
      this.notifier.notifyError(`Failed to clean up .docx.json file: ${error}`)
    }
  }
}
