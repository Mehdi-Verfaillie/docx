import { GithubProvider } from '../provider/github.provider'
import { LocalProvider } from '../provider/local.provider'
import { ProviderConfig } from './repository.controller'

export type Provider = LocalProvider | GithubProvider

export class RepositoryProvider {
  private provider!: Provider

  constructor(config: ProviderConfig) {
    switch (config.type) {
      case 'local':
        this.provider = new LocalProvider()
        break

      case 'github':
        this.provider = new GithubProvider(config.repositories)
        break
      default:
        break
    }
  }

  public get instance(): Provider {
    return this.provider
  }
}
