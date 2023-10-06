import { Documentation } from '../association.manager'
import { DocAssociationsConfig } from '../association.validator'
import { ErrorManager } from '../utils/error.utils'
import { FileSystemManager } from '../utils/fileSystem.utils'
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
  private repository: RepositoryFactory

  private fileManager
  private providerStrategies: ProviderStrategy[]

  constructor(json: string, providerStrategies: ProviderStrategy[]) {
    this.providerStrategies = providerStrategies
    this.repository = new RepositoryFactory(this.mapConfigToProviders(json))
    this.fileManager = new FileSystemManager()
  }

  public async getDocumentations(): Promise<Documentation[]> {
    try {
      return await this.repository.getDocumentations()
    } catch (error) {
      ErrorManager.outputError(`Failed to fetch documentations ${error}`)
      return []
    }
  }

  private mapConfigToProviders(json: string): ProviderConfig[] {
    const config = this.fileManager.processFileContent<DocAssociationsConfig>(json)
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
}
