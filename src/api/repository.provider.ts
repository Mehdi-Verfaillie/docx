import { workspace } from 'vscode'
import { GithubProvider } from '../provider/github.provider'
import { LocalProvider } from '../provider/local.provider'
import { FileSystemManager } from '../utils/fileSystem.utils'
import { ProviderConfig } from './repository.controller'

export type Provider = LocalProvider | GithubProvider

export class RepositoryProvider {
  private provider!: Provider

  constructor(config: ProviderConfig) {
    switch (config.type) {
      case 'local':
        {
          const fileSystem = new FileSystemManager(workspace.fs, config.ignorePatterns)
          this.provider = new LocalProvider(fileSystem)
        }
        break

      case 'github':
        this.provider = new GithubProvider(config.repositories, config.token)
        break
      default:
        break
    }
  }

  public get instance(): Provider {
    return this.provider
  }
}
