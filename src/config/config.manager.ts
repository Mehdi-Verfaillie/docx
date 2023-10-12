import { join } from 'path'
import { FileType } from 'vscode'
import { DocAssociationsConfig } from '../association.validator'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ErrorManager } from '../utils/error.utils'

export class ConfigGenerator {
  constructor(private readonly fileSystem: FileSystemManager) {}

  private async readDocxJson(filePath: string): Promise<DocAssociationsConfig> {
    try {
      const fileContent = await this.fileSystem.readFile(filePath)
      return this.fileSystem.processFileContent<DocAssociationsConfig>(fileContent)
    } catch (error) {
      ErrorManager.outputError(`An error occur when trying to read the config file. ${error}`)
      return { associations: {} }
    }
  }

  private mergeConfigurations(
    existingConfig: DocAssociationsConfig,
    folderObject: Record<string, string[]>
  ): DocAssociationsConfig {
    const newConfig: DocAssociationsConfig = { associations: { ...existingConfig.associations } }
    for (const key in folderObject) {
      if (!newConfig.associations[key]) {
        newConfig.associations[key] = []
      }
    }
    return newConfig
  }

  private async writeDocxJson(config: DocAssociationsConfig, filePath: string): Promise<void> {
    try {
      const content = JSON.stringify(config, null, 2)
      await this.fileSystem.writeFile(filePath, content)
    } catch (error) {
      ErrorManager.outputError(`An error occur when trying to write in the config file. ${error}`)
    }
  }
}

