import { Documentation } from '../association.manager'
import { AssociationsValidator, DocAssociationsConfig } from '../association.validator'
import { StructuralManager } from '../structural.manager'
import { ErrorManager } from '../utils/error.utils'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { WorkspaceManager } from '../utils/workspace.utils'
import { RepositoryFactory } from './repository.factory'
import { ProviderStrategy } from './repository.strategy'

interface LocalProviderConfig {
  type: 'local'
}

interface RemoteProviderConfig {
  type: 'github' /* | 'gitlab' */
  repositories: string[]
}

interface RemoteWebConfig {
  type: 'web'
  url: string
}

export type ProviderConfig = LocalProviderConfig | RemoteProviderConfig | RemoteWebConfig

export class RepositoryController {
  private repository!: RepositoryFactory
  private fileSystem: FileSystemManager
  private baseDir = WorkspaceManager.getWorkspaceFolder()
  private providerStrategies: ProviderStrategy[]
  private validator: AssociationsValidator
  private structuralManager: StructuralManager

  private constructor(
    json: string,
    fileSystem = new FileSystemManager(),
    providerStrategies: ProviderStrategy[]
  ) {
    this.fileSystem = fileSystem
    this.providerStrategies = providerStrategies
    this.structuralManager = new StructuralManager(this.baseDir)
    this.validator = new AssociationsValidator(this.baseDir, this.fileSystem)
    this.configMapper = new ProviderConfigMapper(providerStrategies)
  }

  public static async create(
    json: string,
    providerStrategies: ProviderStrategy[],
    fileSystem = new FileSystemManager()
  ): Promise<RepositoryController> {
    const instance = new RepositoryController(json, fileSystem, providerStrategies)
    await instance.initialize(json)
    return instance
  }

  private async initialize(json: string): Promise<void> {
    const config = this.fileSystem.processFileContent<DocAssociationsConfig>(json)
    await this.validateConfig(config)

    const providerConfigs = await this.mapConfigToProviders(config)
    this.repository = new RepositoryFactory(providerConfigs)
  }

  public async getDocumentations(): Promise<Documentation[]> {
    try {
      return await this.repository.getDocumentations()
    } catch (error) {
      ErrorManager.outputError(`Failed to fetch documentations ${error}`)
      return []
    }
  }

  private async mapConfigToProviders(config: DocAssociationsConfig): Promise<ProviderConfig[]> {
    const providerConfigs: ProviderConfig[] = []

    const docLocationsArray = Object.values(config.associations)
    for (const docLocations of docLocationsArray) {
      docLocations.forEach((docLocation) => {
        const strategy = this.providerStrategies.find((strategy) => strategy.isMatch(docLocation))
        if (strategy) {
          const providerConfig = strategy.getProviderConfig(docLocation)
          providerConfigs.push(providerConfig)
        }
      })
    }

    return providerConfigs
  }

  private async validateConfig(config: DocAssociationsConfig): Promise<void> {
    if (!config) ErrorManager.outputError('Invalid configuration: Cannot find .docx.json file.')

    const structuralErrors = await this.structuralManager.validateConfig(config)
    const associationErrors = await this.validator.validateAssociations(config)

    const errors = [...structuralErrors, ...associationErrors]

    if (errors.length) ErrorManager.outputError(errors)
  }
}
