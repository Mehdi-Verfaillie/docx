import { join } from 'path'
import { FileType } from 'vscode'
import { DocAssociationsConfig } from '../association.validator'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ErrorManager } from '../utils/error.utils'

export class ConfigGenerator {
  constructor(private readonly fileSystem: FileSystemManager) {}

  private async writeDocxJson(config: DocAssociationsConfig, filePath: string): Promise<void> {
    try {
      const content = JSON.stringify(config, null, 2)
      await this.fileSystem.writeFile(filePath, content)
    } catch (error) {
      ErrorManager.outputError(`An error occur when trying to write in the config file. ${error}`)
    }
  }
}