import { Documentation } from '../association.manager'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { RepositoryFactory } from './repository.factory'

interface LocalProviderConfig {
  type: 'local'
}

interface RemoteProviderConfig {
  type: 'github' /* | 'gitlab' */
  repositories: string[]
}

export type ProviderConfig = LocalProviderConfig | RemoteProviderConfig

export class RepositoryController {
  private repository: RepositoryFactory

  // TODO: Normalize the config json file
  private fileManager

  constructor(json: string) {
    this.repository = new RepositoryFactory(this.configNormalizer(json))
    this.fileManager = new FileManager()
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
