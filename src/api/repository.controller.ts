import { Documentation } from '../association.manager'
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
    //@ts-ignore
    this.fileManager = new FileSystemManager()
  }

  public async getDocumentations(): Promise<Documentation[]> {
    try {
      return await this.repository.getDocumentations()
    } catch (error) {
      throw new Error(`Failed to fetch documentations ${error}`)
    }
  }

  private configNormalizer(json: string): ProviderConfig[] {
    // TODO: Normalize the config json file
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const config = this.fileManager.processFileContent(json)
    // ...
    return []
  }
}
