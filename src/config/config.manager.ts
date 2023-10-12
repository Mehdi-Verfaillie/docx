import { join } from 'path'
import { FileType } from 'vscode'
import { DocAssociationsConfig } from '../association.validator'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ErrorManager } from '../utils/error.utils'

export class ConfigGenerator {
  constructor(private readonly fileSystem: FileSystemManager) {}

  public async generateDocxJson(rootPath: string, configFilePath: string) {
    try {
      const folderObject = await this.createFolderObject(rootPath)
      const existingConfig = await this.readDocxJson(configFilePath)
      const newConfig = this.mergeConfigurations(existingConfig, folderObject)
      await this.writeDocxJson(newConfig, configFilePath)
    } catch (error) {
      ErrorManager.outputError(`An error occur when trying to generate the config file. ${error}`)
    }
  }

  public async cleanupDocxJson(configFilePath: string) {
    try {
      const existingConfig = await this.readDocxJson(configFilePath)
      const cleanedConfig = this.sanitizeConfig(existingConfig)
      await this.writeDocxJson(cleanedConfig, configFilePath)
    } catch (error) {
      ErrorManager.outputError(
        `An error occurred while trying to clean up the config file. ${error}`
      )
    }
  }

  private async createFolderObject(directoryPath: string): Promise<Record<string, string[]>> {
    const entries = await this.fileSystem.retrieveNonIgnoredEntries(directoryPath)
    const folderObject: Record<string, string[]> = {}
    for (const [name, type] of entries) {
      if (type === FileType.Directory) {
        folderObject[name] = []
        const subfolder = await this.createFolderObject(join(directoryPath, name))
        Object.assign(folderObject, subfolder) // Merge with the main object
      }
    }
    return folderObject
  }

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

  private sanitizeConfig(config: DocAssociationsConfig): DocAssociationsConfig {
    const cleanedAssociations: Record<string, string[]> = {}

    for (const [key, value] of Object.entries(config.associations)) {
      if (value.length > 0) {
        cleanedAssociations[key] = value
      }
    }

    return {
      associations: cleanedAssociations,
      ignorePatterns: config.ignorePatterns || [],
    }
  }
}
