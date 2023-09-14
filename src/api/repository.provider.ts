import { LocalProvider } from '../provider/local.provider'
import { ProviderConfig } from './repository.controller'

// @ts-ignore
export type Provider = LocalProvider | GithubProvider

export class RepositoryProvider {
  private provider!: Provider

  constructor(config: ProviderConfig) {
    switch (config.type) {
      case 'local':
        this.provider = new LocalProvider()
        break

      case 'github':
        // @ts-ignore
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
